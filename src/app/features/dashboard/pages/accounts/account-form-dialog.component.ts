import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AccountsService, ApiError, ACCOUNT_TYPES } from '../../../../core/api';
import type { Account, CreateAccountRequest, UpdateAccountRequest } from '../../../../core/api';

export interface AccountFormDialogData {
  mode: 'create' | 'edit';
  account?: Account;
}

@Component({
  selector: 'app-account-form-dialog',
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
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Nueva cuenta' : 'Editar cuenta' }}</h2>
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
          <mat-select name="type" [(ngModel)]="model.type" required>
            @for (opt of ACCOUNT_TYPES; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Moneda</mat-label>
          <input matInput name="currency" [(ngModel)]="model.currency" placeholder="PEN" />
        </mat-form-field>
        <mat-form-field class="spw-full-field">
          <mat-label>Saldo inicial</mat-label>
          <input matInput type="number" step="0.01" name="initial_balance" [(ngModel)]="model.initial_balance" />
        </mat-form-field>
        <div class="spw-checkbox-row">
          <mat-checkbox name="is_default" [(ngModel)]="model.is_default">Cuenta por defecto</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !model.name || !model.type" (click)="submit()">
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
export class AccountFormDialogComponent {
  private accountsService = inject(AccountsService);
  private ref = inject(MatDialogRef<AccountFormDialogComponent>);
  data = inject<AccountFormDialogData>(MAT_DIALOG_DATA);

  ACCOUNT_TYPES = ACCOUNT_TYPES;
  model: {
    name: string;
    type: string;
    currency: string;
    initial_balance: number | null;
    is_default: boolean;
  } = {
    name: '',
    type: 'BANK',
    currency: 'PEN',
    initial_balance: 0,
    is_default: false,
  };
  saving = false;
  apiError = '';

  constructor() {
    if (this.data.mode === 'edit' && this.data.account) {
      const a = this.data.account;
      this.model = {
        name: a.name,
        type: a.type,
        currency: a.currency || 'PEN',
        initial_balance: parseFloat(a.initial_balance) || 0,
        is_default: a.is_default,
      };
    }
  }

  submit(): void {
    this.apiError = '';
    if (!this.model.name || !this.model.type) return;
    this.saving = true;

    if (this.data.mode === 'create') {
      const body: CreateAccountRequest = {
        name: this.model.name,
        type: this.model.type as CreateAccountRequest['type'],
        currency: this.model.currency || undefined,
        initial_balance: this.model.initial_balance ?? 0,
        is_default: this.model.is_default,
      };
      this.accountsService.create(body).subscribe({
        next: () => {
          this.saving = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.apiError = err instanceof ApiError ? err.message : 'Error al crear cuenta';
        },
      });
    } else {
      const body: UpdateAccountRequest = {
        name: this.model.name,
        type: this.model.type as UpdateAccountRequest['type'],
        currency: this.model.currency || undefined,
        initial_balance: this.model.initial_balance ?? 0,
        is_default: this.model.is_default,
      };
      this.accountsService.update(this.data.account!.id, body).subscribe({
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
