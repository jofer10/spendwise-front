import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CategoriesService } from '../../../../core/api';
import { ApiError } from '../../../../core/api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../core/api';
import { CATEGORY_KINDS } from '../../../../core/api/categories.constants';

export interface CategoryFormDialogData {
  mode: 'create' | 'edit';
  category?: Category;
}

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Nueva categoría' : 'Editar categoría' }}</h2>
    <mat-dialog-content>
      @if (apiError) {
        <p class="spw-api-error-text" style="margin-bottom: 1rem;">{{ apiError }}</p>
      }
      <form (ngSubmit)="submit()" #form="ngForm">
        <mat-form-field class="spw-full-field">
          <mat-label>Nombre</mat-label>
          <input matInput name="name" [(ngModel)]="model.name" required maxlength="100" />
          <mat-hint align="end">{{ (model.name || '').length }}/100</mat-hint>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Tipo</mat-label>
          <mat-select name="kind" [(ngModel)]="model.kind" required>
            @for (opt of CATEGORY_KINDS; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Color (hex)</mat-label>
          <input matInput name="color" [(ngModel)]="model.color" placeholder="#FF5733" maxlength="20" />
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Icono</mat-label>
          <input matInput name="icon" [(ngModel)]="model.icon" placeholder="shopping-cart" maxlength="50" />
        </mat-form-field>
        <div class="spw-checkbox-row">
          <mat-checkbox name="is_active" [(ngModel)]="model.is_active">Activa</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !model.name || !model.kind" (click)="submit()">
        {{ saving ? 'Guardando…' : (data.mode === 'create' ? 'Crear' : 'Guardar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .spw-full-field { width: 100%; }
      .spw-checkbox-row { margin: 0.5rem 0 1rem; }
    `,
  ],
})
export class CategoryFormDialogComponent {
  private categoriesService = inject(CategoriesService);
  private ref = inject(MatDialogRef<CategoryFormDialogComponent>);
  data = inject<CategoryFormDialogData>(MAT_DIALOG_DATA);

  CATEGORY_KINDS = CATEGORY_KINDS;
  model: {
    name: string;
    kind: string;
    color: string;
    icon: string;
    is_active: boolean;
  } = {
    name: '',
    kind: 'EXPENSE',
    color: '#22c55e',
    icon: '',
    is_active: true,
  };
  saving = false;
  apiError = '';

  constructor() {
    if (this.data.mode === 'edit' && this.data.category) {
      const c = this.data.category;
      this.model = {
        name: c.name,
        kind: c.kind,
        color: c.color || '',
        icon: c.icon || '',
        is_active: c.is_active,
      };
    }
  }

  submit(): void {
    this.apiError = '';
    if (!this.model.name || !this.model.kind) return;
    this.saving = true;

    if (this.data.mode === 'create') {
      const body: CreateCategoryRequest = {
        name: this.model.name,
        kind: this.model.kind as CreateCategoryRequest['kind'],
        color: this.model.color || undefined,
        icon: this.model.icon || undefined,
        is_active: this.model.is_active,
      };
      this.categoriesService.create(body).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.apiError = err instanceof ApiError ? err.message : 'Error al crear categoría';
        },
      });
    } else {
      const body: UpdateCategoryRequest = {
        name: this.model.name,
        kind: this.model.kind as UpdateCategoryRequest['kind'],
        color: this.model.color || undefined,
        icon: this.model.icon || undefined,
        is_active: this.model.is_active,
      };
      this.categoriesService.update(this.data.category!.id, body).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.apiError = err instanceof ApiError ? err.message : 'Error al guardar';
        },
      });
    }
  }
}
