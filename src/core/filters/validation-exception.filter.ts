// src/common/filters/validation-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../responses/api-response';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        const apiResponse = ApiResponse.warning(exceptionResponse.message);

        response.status(status).json(apiResponse);
    }
}
