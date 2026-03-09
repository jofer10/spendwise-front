import type { TxnType } from './enums';

export const TXN_TYPES: { value: TxnType; label: string }[] = [
  { value: 'INCOME', label: 'Ingreso' },
  { value: 'EXPENSE', label: 'Gasto' },
];
