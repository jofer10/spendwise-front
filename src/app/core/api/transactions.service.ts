import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '../http/api-client';
import type { ApiResponse } from './api-response.types';
import { unwrapApiResponse } from './api-response.types';
import type {
  Transaction,
  TransactionsListParams,
  TransactionsPaginatedData,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from './transactions.types';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  constructor(private api: ApiClient) {}

  list(params?: TransactionsListParams): Observable<TransactionsPaginatedData> {
    const query: Record<string, string | number | boolean> = {};
    if (params?.date_from) query['date_from'] = params.date_from;
    if (params?.date_to) query['date_to'] = params.date_to;
    if (params?.type) query['type'] = params.type;
    if (params?.account_id) query['account_id'] = params.account_id;
    if (params?.category_id) query['category_id'] = params.category_id;
    if (params?.page != null) query['page'] = params.page;
    if (params?.limit != null) query['limit'] = params.limit;

    return unwrapApiResponse(
      this.api.get<ApiResponse<TransactionsPaginatedData>>('/api/transactions', Object.keys(query).length ? query : undefined)
    ).pipe(
      map((data) => {
        if (data == null) {
          return { data: [], meta: { total: 0, page: 1, limit: 20, total_pages: 0 } };
        }
        return data;
      })
    );
  }

  getById(id: string): Observable<Transaction> {
    return unwrapApiResponse(
      this.api.get<ApiResponse<Transaction>>(`/api/transactions/${id}`)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Transacción no encontrada');
        return data;
      })
    );
  }

  create(body: CreateTransactionRequest): Observable<Transaction> {
    return unwrapApiResponse(
      this.api.post<ApiResponse<Transaction>>('/api/transactions', body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Transacción no devuelta');
        return data;
      })
    );
  }

  update(id: string, body: UpdateTransactionRequest): Observable<Transaction> {
    return unwrapApiResponse(
      this.api.patch<ApiResponse<Transaction>>(`/api/transactions/${id}`, body)
    ).pipe(
      map((data) => {
        if (data == null) throw new Error('Transacción no devuelta');
        return data;
      })
    );
  }

  delete(id: string): Observable<void> {
    return unwrapApiResponse(
      this.api.delete<ApiResponse<null>>(`/api/transactions/${id}`)
    ).pipe(map(() => undefined));
  }
}
