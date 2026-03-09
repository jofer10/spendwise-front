import type { TxnType } from './enums';
import type { AccountType } from './enums';
import type { CategoryKind } from './enums';

/** Relación cuenta embebida en transacción */
export interface TransactionAccountRelation {
  id: string;
  name: string;
  type: AccountType;
}

/** Relación categoría embebida en transacción */
export interface TransactionCategoryRelation {
  id: string;
  name: string;
  kind: CategoryKind;
}

/** Relación método de pago (puede ser null) */
export interface TransactionPaymentMethodRelation {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  payment_method_id: string | null;
  type: TxnType;
  /** Decimal como string desde la API */
  amount: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  accounts: TransactionAccountRelation;
  categories: TransactionCategoryRelation;
  payment_methods: TransactionPaymentMethodRelation | null;
}

export interface TransactionsListParams {
  date_from?: string;
  date_to?: string;
  type?: TxnType;
  account_id?: string;
  category_id?: string;
  page?: number;
  limit?: number;
}

export interface TransactionsMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TransactionsPaginatedData {
  data: Transaction[];
  meta: TransactionsMeta;
}

export interface CreateTransactionRequest {
  account_id: string;
  category_id: string;
  payment_method_id?: string | null;
  type: TxnType;
  amount: number;
  transaction_date: string;
  description?: string | null;
}

export interface UpdateTransactionRequest {
  account_id?: string;
  category_id?: string;
  payment_method_id?: string | null;
  type?: TxnType;
  amount?: number;
  transaction_date?: string;
  description?: string | null;
}
