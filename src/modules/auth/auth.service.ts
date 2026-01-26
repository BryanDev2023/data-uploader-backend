import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from './users/users.service';
import { PasswordResetTokenMongodbService } from './db/password-reset-token-mongodb.service';
import { RevokedTokenMongodbService } from './db/revoked-token-mongodb.service';
import { randomBytes } from 'crypto';
import config from '../../core/config/environment';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly resetTokenTtlMs = 60 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetTokenService: PasswordResetTokenMongodbService,
    private readonly revokedTokenService: RevokedTokenMongodbService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existing = await this.usersService
      .findUserByEmail(signUpDto.email)
      .catch(() => null);

    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    return this.usersService.createUser({
      email: signUpDto.email,
      password: signUpDto.password,
      fullName: signUpDto.fullName,
      preferences: undefined,
    });
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findUserByEmail(signInDto.email);

    if (!user || user.password !== signInDto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role ?? 'admin' },
      config.jwtSecret,
      { expiresIn: '7d' },
    );

    return {
      token,
      user: this.omitPassword(user),
    };
  }

  async confirmPassword(userId: string, confirmPasswordDto: ConfirmPasswordDto) {
    const user = await this.usersService.findUserById(userId);

    if (!user || user.password !== confirmPasswordDto.password) {
      throw new BadRequestException('Contraseña incorrecta');
    }

    return { confirmed: true };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const targetUserId = changePasswordDto.userId ?? userId;
    const user = await this.usersService.findUserById(targetUserId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.password !== changePasswordDto.currentPassword) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    await this.usersService.updateUser(targetUserId, {
      password: changePasswordDto.newPassword,
    });

    return { updated: true };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findUserById(userId);
    return this.omitPassword(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findUserByEmail(forgotPasswordDto.email);

    await this.passwordResetTokenService.deleteByUserId(user._id.toString());

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMs);

    await this.passwordResetTokenService.create(user._id.toString(), token, expiresAt);

    return {
      email: user.email,
      tokenSent: true,
      expiresAt,
    };
  }

  async verifyResetToken(token: string) {
    const tokenRecord = await this.passwordResetTokenService.findByToken(token);

    if (!tokenRecord) {
      throw new BadRequestException('Token inválido o expirado');
    }

    return {
      valid: true,
      userId: tokenRecord.userId.toString(),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const tokenRecord = await this.passwordResetTokenService.findByToken(resetPasswordDto.token);

    if (!tokenRecord) {
      throw new BadRequestException('Token inválido o expirado');
    }

    await this.usersService.updateUser(tokenRecord.userId.toString(), {
      password: resetPasswordDto.newPassword,
    });

    await this.passwordResetTokenService.markAsUsed(resetPasswordDto.token);

    return {
      success: true,
      message: 'Contraseña restablecida exitosamente',
    };
  }

  async signOut(token: string) {
    if (!token) {
      throw new BadRequestException('Token no proporcionado');
    }

    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    const exp = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(exp);

    await this.revokedTokenService.revoke(token, expiresAt);

    return { success: true };
  }

  private omitPassword(user: any) {
    if (!user) {
      return user;
    }

    const { password, ...rest } = user;
    return rest;
  }
}
