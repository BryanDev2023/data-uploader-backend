import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument, UserWithId } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Omit<UserWithId, 'password'>> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .lean();

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const createdUser = await this.userModel.create({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      password: createUserDto.password,
      preferences: createUserDto.preferences,
      role: 'admin',
    });

    const { password, ...userWithoutPassword } = createdUser.toObject();

    return userWithoutPassword;
  }

  async findAllUsers(): Promise<UserWithId[]> {
    return this.userModel.find().lean() as Promise<UserWithId[]>;
  }

  async findUserById(id: string): Promise<UserWithId> {
    const user = await this.userModel.findById(id).lean() as UserWithId | null;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<UserWithId> {
    const user = await this.userModel.findOne({ email }).lean() as UserWithId | null;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserWithId> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true }
    )
    .lean() as UserWithId | null;

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).lean() as UserWithId | null;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
