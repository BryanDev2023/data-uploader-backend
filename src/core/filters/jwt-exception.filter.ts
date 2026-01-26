import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../responses/api-response';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const error = (exception.getResponse() as any).cause;

        if (error instanceof TokenExpiredError) {
            return response.status(401).json(
                ApiResponse.permissionError('El token ha expirado, por favor inicie sesión nuevamente')
            );
        }

        if (error instanceof JsonWebTokenError) {
            return response.status(401).json(
                ApiResponse.permissionError('Token inválido')
            );
        }

        if (exception.message === 'No auth token') {
            return response.status(401).json(
                ApiResponse.permissionError('No se proporcionó un token de autenticación')
            );
        }

        return response.status(401).json(
            ApiResponse.permissionError('Credenciales inválidas')
        );
    }
} 