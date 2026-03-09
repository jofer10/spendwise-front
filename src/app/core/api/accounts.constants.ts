import type { AccountType } from './enums';

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'BANK', label: 'Banco' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'WALLET', label: 'Billetera' },
];
