import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from './users/users.module';
import { PasswordResetTokenMongodbService } from './db/password-reset-token-mongodb.service';
import { PasswordResetToken, PasswordResetTokenSchema } from './entitity/password-reset-token.entity';
import { RevokedTokenMongodbService } from './db/revoked-token-mongodb.service';
import { RevokedToken, RevokedTokenSchema } from './entitity/revoked-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import config from '../../core/config/environment';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetTokenMongodbService,
    RevokedTokenMongodbService,
    JwtStrategy,
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
    UsersModule,
    MongooseModule.forFeature([
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: RevokedToken.name, schema: RevokedTokenSchema },
    ]),
  ],
})
export class AuthModule {}
