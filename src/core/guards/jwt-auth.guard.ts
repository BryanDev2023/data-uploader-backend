import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Verificar si hay token
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            throw new UnauthorizedException('No auth token');
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (info instanceof Error) {
            throw new UnauthorizedException({
                message: info.message,
                cause: info
            });
        }

        if (err || !user) {
            throw new UnauthorizedException({
                message: err?.message || 'Unauthorized',
                cause: err
            });
        }

        return user;
    }
} 