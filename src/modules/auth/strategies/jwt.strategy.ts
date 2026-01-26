import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../core/interfaces/jwt-payload';
import config from '../../../core/config/environment';
import { UsersService } from '../users/users.service';
import { RevokedTokenMongodbService } from '../db/revoked-token-mongodb.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly revokedTokenService: RevokedTokenMongodbService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
    if (token && await this.revokedTokenService.isRevoked(token)) {
      throw new UnauthorizedException('Token revocado');
    }

    const user = await this.usersService.findUserById(payload.sub).catch(() => null);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }
}
