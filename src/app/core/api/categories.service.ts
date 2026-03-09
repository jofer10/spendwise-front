import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '../http/api-client';
import type { ApiResponse } from './api-response.types';
import { unwrapApiResponse } from './api-response.types';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './categories.types';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private api: ApiClient) {}

  list(): Observable<Category[]> {
    return unwrapApiResponse(
      this.api.get<ApiResponse<Category[]>>('/api/categories')
    ).pipe(map((data) => data ?? []));
  }

  getById(id: string): Observable<Category> {
    return unwrapApiResponse(
      this.api.get<ApiResponse<Category>>(`/api/categories/${id}`)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Categoría no encontrada');
        return data;
      })
    );
  }

  create(body: CreateCategoryRequest): Observable<Category> {
    return unwrapApiResponse(
      this.api.post<ApiResponse<Category>>('/api/categories', body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Categoría no devuelta');
        return data;
      })
    );
  }

  update(id: string, body: UpdateCategoryRequest): Observable<Category> {
    return unwrapApiResponse(
      this.api.patch<ApiResponse<Category>>(`/api/categories/${id}`, body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Categoría no devuelta');
        return data;
      })
    );
  }

  delete(id: string): Observable<void> {
    return unwrapApiResponse(
      this.api.delete<ApiResponse<null>>(`/api/categories/${id}`)
    ).pipe(map(() => undefined));
  }
}
