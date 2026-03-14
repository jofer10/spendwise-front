import { AfterViewInit, Component, ElementRef, inject, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
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
  host: { class: 'spw-app-dialog-host' },
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <div class="spw-dialog-root">
      <h2 class="spw-dialog-title">{{ data.mode === 'create' ? 'Nueva transacción' : 'Editar transacción' }}</h2>
      <div class="spw-dialog-body">
        <form (ngSubmit)="submit()" #form="ngForm" class="spw-dialog-form">
          @if (apiError) {
            <div class="spw-dialog-error">{{ apiError }}</div>
          }
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Tipo</mat-label>
            <mat-select name="type" [(ngModel)]="model.type" required panelClass="spw-select-panel">
              @for (opt of TXN_TYPES; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Cuenta</mat-label>
            <mat-select name="account_id" [(ngModel)]="model.account_id" required panelClass="spw-select-panel">
              @for (a of data.accounts; track a.id) {
                <mat-option [value]="a.id">{{ a.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Categoría</mat-label>
            <mat-select name="category_id" [(ngModel)]="model.category_id" required panelClass="spw-select-panel">
              @for (c of data.categories; track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Monto</mat-label>
            <input matInput type="number" step="0.01" min="0.01" name="amount" [(ngModel)]="model.amount" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Fecha</mat-label>
            <input matInput type="date" name="transaction_date" [(ngModel)]="model.transaction_date" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Descripción</mat-label>
            <input matInput name="description" [(ngModel)]="model.description" maxlength="500" />
            <mat-hint align="end">{{ (model.description || '').length }}/500</mat-hint>
          </mat-form-field>
        </form>
      </div>
      <div class="spw-dialog-actions">
        <button mat-button type="button" (click)="close()">Cancelar</button>
        <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !isValid()" (click)="submit()">
          {{ saving ? 'Guardando…' : (data.mode === 'create' ? 'Crear' : 'Guardar') }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block; border-radius: 16px; overflow: hidden;
        transition: opacity 0.24s cubic-bezier(0.4, 0, 1, 1);
      }
      :host.spw-dialog-closing { opacity: 0; }
      .spw-dialog-root {
        background: #1e293b; color: #e2e8f0; display: flex; flex-direction: column; border-radius: 16px; box-sizing: border-box; min-width: 320px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
      }
      :host.spw-dialog-closing .spw-dialog-root { transform: scale(0.97); }
      .spw-dialog-title {
        margin: 0; padding: 1.25rem 1.5rem 0.75rem; font-size: 1.25rem; font-weight: 600; color: #f1f5f9;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15); flex-shrink: 0;
      }
      .spw-dialog-body { flex: 1; padding: 1.25rem 1.5rem; overflow-y: auto; }
      .spw-dialog-form { display: flex; flex-direction: column; gap: 0.25rem; }
      .spw-dialog-error {
        padding: 0.75rem 1rem; margin-bottom: 0.75rem; background: rgba(248, 113, 113, 0.12);
        border: 1px solid rgba(248, 113, 113, 0.35); border-radius: 8px; color: #fca5a5; font-size: 0.875rem;
      }
      .spw-dialog-field { width: 100%; }
      .spw-dialog-actions {
        padding: 1rem 1.5rem 1.25rem; border-top: 1px solid rgba(148, 163, 184, 0.15);
        display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;
      }
      .spw-dialog-actions button:not(.spw-btn-primary) { color: #94a3b8; }
      .spw-dialog-actions button:not(.spw-btn-primary):hover { color: #22c55e; background: rgba(34, 197, 94, 0.08); }
    `,
  ],
})
export class TransactionFormDialogComponent implements OnInit, AfterViewInit {
  private transactionsService = inject(TransactionsService);
  private ref = inject(MatDialogRef<TransactionFormDialogComponent>);
  private el = inject(ElementRef<HTMLElement>);
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

  ngOnInit(): void {
    this.ref.backdropClick().subscribe(() => this.closeDialog());
    this.ref.keydownEvents().pipe(filter((e) => e.key === 'Escape')).subscribe(() => this.closeDialog());
  }

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

  ngAfterViewInit(): void {
    const container =
      this.el.nativeElement.closest('.mat-mdc-dialog-container') ||
      this.el.nativeElement.closest('.mat-dialog-container') ||
      this.el.nativeElement.parentElement;
    if (container instanceof HTMLElement) {
      container.style.setProperty('background', 'transparent');
      container.style.setProperty('background-color', 'transparent');
      container.style.setProperty('border', 'none');
      container.style.setProperty('box-shadow', 'none');
      container.style.setProperty('padding', '0');
      container.style.setProperty('outline', 'none');
      const surface = container.querySelector('.mat-mdc-dialog-surface, .mdc-dialog__surface') as HTMLElement | null;
      if (surface) {
        surface.style.setProperty('background', 'transparent');
        surface.style.setProperty('background-color', 'transparent');
        surface.style.setProperty('border', 'none');
        surface.style.setProperty('box-shadow', 'none');
        surface.style.setProperty('padding', '0');
        surface.style.setProperty('outline', 'none');
      }
    }
    this.applyBackdropBlur();
  }

  private applyBackdropBlur(): void {
    const pane = this.el.nativeElement.closest('.cdk-overlay-pane');
    const backdrop = pane?.parentElement?.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
    if (backdrop) {
      backdrop.style.setProperty('backdrop-filter', 'blur(4px)');
      backdrop.style.setProperty('-webkit-backdrop-filter', 'blur(4px)');
    }
  }

  private closing = false;
  private readonly closeDuration = 240;

  close(): void {
    this.closeDialog();
  }

  closeDialog(result?: boolean): void {
    if (this.closing) return;
    this.closing = true;
    const transition = 'opacity 0.24s cubic-bezier(0.4, 0, 1, 1)';
    this.el.nativeElement.classList.add('spw-dialog-closing');
    const container =
      this.el.nativeElement.closest('.mat-mdc-dialog-container') ||
      this.el.nativeElement.closest('.mat-dialog-container') ||
      this.el.nativeElement.parentElement;
    if (container instanceof HTMLElement) {
      container.style.setProperty('transition', transition);
      container.style.setProperty('opacity', '0');
    }
    const pane = this.el.nativeElement.closest('.cdk-overlay-pane');
    const backdrop = pane?.parentElement?.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
    if (backdrop) {
      backdrop.style.setProperty('transition', transition);
      backdrop.style.setProperty('opacity', '0');
    }
    setTimeout(() => this.ref.close(result), this.closeDuration);
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
          this.closeDialog(true);
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
          this.closeDialog(true);
        },
        error: (err) => {
          this.saving = false;
          this.apiError = err instanceof ApiError ? err.message : 'Error al guardar';
        },
      });
    }
  }
}
