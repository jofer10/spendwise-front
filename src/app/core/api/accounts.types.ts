import type { AccountType } from './enums';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  /** Decimal como string desde la API */
  initial_balance: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  currency?: string;
  initial_balance?: number;
  is_default?: boolean;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  currency?: string;
  initial_balance?: number;
  is_default?: boolean;
}
