/**
 * CLASS: ApiResponse
 * Clase utilitaria para generar respuestas estandarizadas de la API.
 * Proporciona una interfaz consistente para todas las respuestas HTTP
 * y métodos estáticos para los casos de uso más comunes.
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { HTTP_RESPONSE } from './htt-response';

export class ApiResponse {
  /**
   * Constructor para crear una nueva respuesta de API
   * @param type Tipo de respuesta (SUCCESS, WARNING, ERROR, etc.)
   * @param message Mensaje descriptivo
   * @param statusCode Código de estado HTTP
   * @param data Datos opcionales de la respuesta
   */
  constructor(
    public type: string,
    public message: string,
    public statusCode: number,
    public data: any = null,
  ) {}

  /**
   * Crea una respuesta de éxito
   * @param message Mensaje de éxito
   * @param data Datos opcionales
   * @param statusCode Código de estado (default: 200 OK)
   */
  static success(message: string, data: any = null, statusCode: number = HttpStatus.OK): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.SUCCESS, message, statusCode, data);
  }

  /**
   * Crea una respuesta de advertencia
   * @param message Mensaje de advertencia
   * @param data Datos opcionales
   */
  static warning(message: string, data: any = null): ApiResponse {
    throw new ApiResponse(HTTP_RESPONSE.WARNING, message, HttpStatus.BAD_REQUEST, data);
  }

  /**
   * Crea una respuesta de error que se integra con las excepciones de NestJS
   * @param error El error original de NestJS
   */
  static error(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    
    const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Error interno del servidor';
    
    throw new HttpException(
      new ApiResponse(HTTP_RESPONSE.ERROR, message, statusCode),
      statusCode
    );
  }

  /**
   * Crea una respuesta informativa
   * @param message Mensaje informativo
   * @param data Datos opcionales
   */
  static info(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.INFO, message, HttpStatus.OK, data);
  }

  /**
   * Crea una respuesta HTTP 200 OK
   * @param message Mensaje de éxito
   * @param data Datos opcionales
   */
  static httpOk(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.HTTP_200_OK, message, HttpStatus.OK, data);
  }

  /**
   * Crea una respuesta de error de permisos
   * @param message Mensaje de error de permisos
   * @param data Datos opcionales
   */
  static permissionError(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.PERMISION_ERROR, message, HttpStatus.UNAUTHORIZED, data);
  }

  /**
   * Crea una respuesta de error por JSON malformado
   * @param message Mensaje de error
   * @param data Datos opcionales
   */
  static malformedJson(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.MALFORMED_JSON, message, HttpStatus.BAD_REQUEST, data);
  }

  /**
   * Crea una respuesta de acceso denegado
   * @param message Mensaje de acceso denegado
   * @param data Datos opcionales
   */
  static accessDenied(message: string, data: any = null): ApiResponse {
    return new ApiResponse(HTTP_RESPONSE.ACCESS_DENIED, message, HttpStatus.FORBIDDEN, data);
  }
} 