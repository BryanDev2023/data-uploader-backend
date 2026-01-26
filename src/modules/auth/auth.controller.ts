import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../core/decorators/public.decorator';
import { ApiResponse } from '../../core/responses/api-response';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<ApiResponse> {
    try {
      const user = await this.authService.signUp(signUpDto);
      return ApiResponse.success('Usuario creado exitosamente', user);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Public()
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.signIn(signInDto);
      return ApiResponse.success('Usuario autenticado exitosamente', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-password')
  async confirmPassword(
    @Request() req,
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<ApiResponse> {
    try {
      const result = await this.authService.confirmPassword(req.user.id, confirmPasswordDto);
      return ApiResponse.success('Contraseña confirmada exitosamente', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponse> {
    try {
      const result = await this.authService.changePassword(req.user.id, changePasswordDto);
      return ApiResponse.success('Contraseña actualizada exitosamente', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req): Promise<ApiResponse> {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);
      return ApiResponse.success('Perfil obtenido exitosamente', user);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.forgotPassword(forgotPasswordDto);
      return ApiResponse.success(
        'Se ha enviado un correo con las instrucciones para recuperar su contraseña',
        result,
      );
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Public()
  @Get('verify-reset-token/:token')
  async verifyResetToken(@Param('token') token: string): Promise<ApiResponse> {
    try {
      const result = await this.authService.verifyResetToken(token);
      return ApiResponse.success('Token válido', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ApiResponse> {
    try {
      if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
        return ApiResponse.error(new BadRequestException('Las contraseñas no coinciden'));
      }

      const result = await this.authService.resetPassword(resetPasswordDto);
      return ApiResponse.success(result.message, result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signOut(@Request() req): Promise<ApiResponse> {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const result = await this.authService.signOut(token);
      return ApiResponse.success('Sesión cerrada exitosamente', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
