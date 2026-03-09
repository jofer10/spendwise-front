import type { CategoryKind } from './enums';

export const CATEGORY_KINDS: { value: CategoryKind; label: string }[] = [
  { value: 'INCOME', label: 'Ingreso' },
  { value: 'EXPENSE', label: 'Gasto' },
  { value: 'BOTH', label: 'Ambos' },
];
