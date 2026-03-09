import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '../http/api-client';
import type { ApiResponse } from './api-response.types';
import { unwrapApiResponse } from './api-response.types';
import type { Account, CreateAccountRequest, UpdateAccountRequest } from './accounts.types';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  constructor(private api: ApiClient) {}

  list(): Observable<Account[]> {
    return unwrapApiResponse(
      this.api.get<ApiResponse<Account[]>>('/api/accounts')
    ).pipe(map((data) => data ?? []));
  }

  getById(id: string): Observable<Account> {
    return unwrapApiResponse(
      this.api.get<ApiResponse<Account>>(`/api/accounts/${id}`)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Cuenta no encontrada');
        return data;
      })
    );
  }

  create(body: CreateAccountRequest): Observable<Account> {
    return unwrapApiResponse(
      this.api.post<ApiResponse<Account>>('/api/accounts', body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Cuenta no devuelta');
        return data;
      })
    );
  }

  update(id: string, body: UpdateAccountRequest): Observable<Account> {
    return unwrapApiResponse(
      this.api.patch<ApiResponse<Account>>(`/api/accounts/${id}`, body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Cuenta no devuelta');
        return data;
      })
    );
  }

  delete(id: string): Observable<void> {
    return unwrapApiResponse(
      this.api.delete<ApiResponse<null>>(`/api/accounts/${id}`)
    ).pipe(map(() => undefined));
  }
}
