/**
 * Estructura de respuesta unificada de la API (Accounts, Categories, Transactions, etc.)
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string | string[] | null;
  data: T | null;
  statusCode?: number;
}

/**
 * Error lanzado cuando la API devuelve success: false
 */
export class ApiError extends Error {
  constructor(
    message: string | string[],
    public readonly statusCode?: number
  ) {
    const text = Array.isArray(message) ? message[0] ?? 'Error' : message;
    super(text);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Obtiene el mensaje de error como string (si es array, devuelve el primero o unidos)
 */
export function getErrorMessage(message: string | string[] | null): string {
  if (message == null) return 'Error desconocido';
  return Array.isArray(message) ? (message[0] ?? message.join('. ')) : message;
}

import { map, catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte Observable<ApiResponse<T>> en Observable<T>; lanza ApiError si success === false.
 * También convierte HttpErrorResponse (4xx/5xx con body unificado) en ApiError.
 */
export function unwrapApiResponse<T>(
  source: Observable<ApiResponse<T> | T>
): Observable<T> {
  return source.pipe(
    map((res) => {
      if (Array.isArray(res)) return res as unknown as T;
      if (typeof res !== 'object' || res === null) throw new ApiError('Respuesta inválida');
      if (!(res as ApiResponse<T>).success) {
        const r = res as ApiResponse<T>;
        throw new ApiError(getErrorMessage(r.message), r.statusCode);
      }
      return (res as ApiResponse<T>).data as T;
    }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object') {
        const body = err.error as { success?: boolean; message?: string | string[]; statusCode?: number };
        if (body.success === false) {
          return throwError(
            () => new ApiError(getErrorMessage(body.message ?? null), body.statusCode ?? err.status)
          );
        }
      }
      return throwError(() => err);
    })
  );
}
