/**
 * CONSTANTS: HTTP Response Codes
 * Define los tipos de respuesta estándar para la API.
 * Cada código tiene un significado específico:
 * - SUCCESS (1): Operación exitosa
 * - WARNING (2): Advertencia o precaución
 * - ERROR (3): Error interno
 * - INFO (4): Información
 * - HTTP_200_OK (200): Respuesta HTTP exitosa
 * - PERMISION_ERROR (401): Error de permisos
 * - CODE_NOT_DEFINED (601): Código no definido
 * - MALFORMED_JSON (701): JSON malformado
 * - ACCESS_DENIED (403): Acceso denegado
 */

export const HTTP_RESPONSE = {
    SUCCESS: '1',
    WARNING: '2',
    ERROR: '3',
    INFO: '4',
    HTTP_200_OK: '200',
    PERMISION_ERROR: '401',
    CODE_NOT_DEFINED: '601',
    MALFORMED_JSON: '701',
    UNAUTHORIZED: '401',
    ACCESS_DENIED: '403',
  } as const; 
  