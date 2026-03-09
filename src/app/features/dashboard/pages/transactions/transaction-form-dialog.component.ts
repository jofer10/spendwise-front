import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TransactionsService } from '../../../../core/api';
import { ApiError } from '../../../../core/api';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../../../../core/api';
import type { Account } from '../../../../core/api';
import type { Category } from '../../../../core/api';
import { TXN_TYPES } from '../../../../core/api/transactions.constants';

export interface TransactionFormDialogData {
  mode: 'create' | 'edit';
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
}

@Component({
  selector: 'app-transaction-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Nueva transacción' : 'Editar transacción' }}</h2>
    <mat-dialog-content>
      @if (apiError) {
        <p class="spw-api-error-text" style="margin-bottom: 1rem;">{{ apiError }}</p>
      }
      <form (ngSubmit)="submit()" #form="ngForm">
        <mat-form-field class="spw-full-field">
          <mat-label>Tipo</mat-label>
          <mat-select name="type" [(ngModel)]="model.type" required>
            @for (opt of TXN_TYPES; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Cuenta</mat-label>
          <mat-select name="account_id" [(ngModel)]="model.account_id" required>
            @for (a of data.accounts; track a.id) {
              <mat-option [value]="a.id">{{ a.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Categoría</mat-label>
          <mat-select name="category_id" [(ngModel)]="model.category_id" required>
            @for (c of data.categories; track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Monto</mat-label>
          <input matInput type="number" step="0.01" min="0.01" name="amount" [(ngModel)]="model.amount" required />
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Fecha</mat-label>
          <input matInput type="date" name="transaction_date" [(ngModel)]="model.transaction_date" required />
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Descripción</mat-label>
          <input matInput name="description" [(ngModel)]="model.description" maxlength="500" />
          <mat-hint align="end">{{ (model.description || '').length }}/500</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !isValid()" (click)="submit()">
        {{ saving ? 'Guardando…' : (data.mode === 'create' ? 'Crear' : 'Guardar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .spw-full-field { width: 100%; }
    `,
  ],
})
export class TransactionFormDialogComponent {
  private transactionsService = inject(TransactionsService);
  private ref = inject(MatDialogRef<TransactionFormDialogComponent>);
  data = inject<TransactionFormDialogData>(MAT_DIALOG_DATA);

  TXN_TYPES = TXN_TYPES;
  model: {
    account_id: string;
    category_id: string;
    type: string;
    amount: number | null;
    transaction_date: string;
    description: string;
  } = {
    account_id: '',
    category_id: '',
    type: 'EXPENSE',
    amount: null,
    transaction_date: new Date().toISOString().slice(0, 10),
    description: '',
  };
  saving = false;
  apiError = '';

  constructor() {
    if (this.data.mode === 'edit' && this.data.transaction) {
      const t = this.data.transaction;
      this.model = {
        account_id: t.account_id,
        category_id: t.category_id,
        type: t.type,
        amount: parseFloat(t.amount) || null,
        transaction_date: t.transaction_date ? t.transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: t.description || '',
      };
    } else if (this.data.accounts.length) {
      this.model.account_id = this.data.accounts[0].id;
    }
    if (this.data.categories.length && !this.model.category_id) {
      this.model.category_id = this.data.categories[0].id;
    }
  }

  isValid(): boolean {
    return !!(
      this.model.account_id &&
      this.model.category_id &&
      this.model.type &&
      this.model.amount != null &&
      this.model.amount >= 0.01 &&
      this.model.transaction_date
    );
  }

  submit(): void {
    this.apiError = '';
    if (!this.isValid()) return;
    this.saving = true;

    if (this.data.mode === 'create') {
      const body: CreateTransactionRequest = {
        account_id: this.model.account_id,
        category_id: this.model.category_id,
        type: this.model.type as CreateTransactionRequest['type'],
        amount: this.model.amount!,
        transaction_date: this.model.transaction_date,
        description: this.model.description || null,
      };
      this.transactionsService.create(body).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.apiError = err instanceof ApiError ? err.message : 'Error al crear transacción';
        },
      });
    } else {
      const body: UpdateTransactionRequest = {
        account_id: this.model.account_id,
        category_id: this.model.category_id,
        type: this.model.type as UpdateTransactionRequest['type'],
        amount: this.model.amount!,
        transaction_date: this.model.transaction_date,
        description: this.model.description || null,
      };
      this.transactionsService.update(this.data.transaction!.id, body).subscribe({
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
