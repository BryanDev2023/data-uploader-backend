import { Body, Controller, Post, Get, Patch, Delete, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from 'src/core/responses/api-response';

import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponse> {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return ApiResponse.success('Usuario creado', user, 201);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllUsers(): Promise<ApiResponse> {
    try {
      const users = await this.usersService.findAllUsers();
      return ApiResponse.success('Usuarios encontrados', users, 200);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findUserById(id);
      return ApiResponse.success('Usuario encontrado', user, 200);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findUserByEmail(email);
      return ApiResponse.success('Usuario encontrado', user, 200);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-user/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse> {
    try {
      const user = await this.usersService.updateUser(id, updateUserDto);
      return ApiResponse.success('Usuario actualizado', user, 200);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-user/:id')
  async deleteUser(@Param('id') id: string): Promise<ApiResponse> {
    try {
      await this.usersService.deleteUser(id);
      return ApiResponse.success('Usuario eliminado', null, 200);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
