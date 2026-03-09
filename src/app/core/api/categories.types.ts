import type { CategoryKind } from './enums';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  kind: CategoryKind;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  kind?: CategoryKind;
  color?: string;
  icon?: string;
  is_active?: boolean;
}
