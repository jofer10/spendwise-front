import { AfterViewInit, Component, ElementRef, inject, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
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
  host: { class: 'spw-app-dialog-host' },
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
    <div class="spw-dialog-root">
      <h2 class="spw-dialog-title">{{ data.mode === 'create' ? 'Nueva cuenta' : 'Editar cuenta' }}</h2>
      <div class="spw-dialog-body">
        <form (ngSubmit)="submit()" #form="ngForm" class="spw-dialog-form">
          @if (apiError) {
            <div class="spw-dialog-error">{{ apiError }}</div>
          }
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Nombre</mat-label>
            <input matInput name="name" [(ngModel)]="model.name" required maxlength="100" />
            <mat-hint align="end">{{ (model.name || '').length }}/100</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Tipo</mat-label>
            <mat-select name="type" [(ngModel)]="model.type" required panelClass="spw-select-panel">
              @for (opt of ACCOUNT_TYPES; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Moneda</mat-label>
            <input matInput name="currency" [(ngModel)]="model.currency" placeholder="PEN" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Saldo inicial</mat-label>
            <input matInput type="number" step="0.01" name="initial_balance" [(ngModel)]="model.initial_balance" />
          </mat-form-field>
          <div class="spw-dialog-checkbox">
            <mat-checkbox name="is_default" [(ngModel)]="model.is_default">Cuenta por defecto</mat-checkbox>
          </div>
        </form>
      </div>
      <div class="spw-dialog-actions">
        <button mat-button type="button" (click)="close()">Cancelar</button>
        <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !model.name || !model.type" (click)="submit()">
          {{ saving ? 'Guardando…' : (data.mode === 'create' ? 'Crear' : 'Guardar') }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        border-radius: 16px;
        overflow: hidden;
        transition: opacity 0.24s cubic-bezier(0.4, 0, 1, 1);
      }
      :host.spw-dialog-closing {
        opacity: 0;
      }
      .spw-dialog-root {
        background: #1e293b;
        color: #e2e8f0;
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        box-sizing: border-box;
        min-width: 320px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
      }
      :host.spw-dialog-closing .spw-dialog-root {
        transform: scale(0.97);
      }
      .spw-dialog-title {
        margin: 0;
        padding: 1.25rem 1.5rem 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f1f5f9;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        flex-shrink: 0;
      }
      .spw-dialog-body {
        flex: 1;
        padding: 1.25rem 1.5rem;
        overflow-y: auto;
      }
      .spw-dialog-form {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .spw-dialog-error {
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        background: rgba(248, 113, 113, 0.12);
        border: 1px solid rgba(248, 113, 113, 0.35);
        border-radius: 8px;
        color: #fca5a5;
        font-size: 0.875rem;
      }
      .spw-dialog-field {
        width: 100%;
      }
      .spw-dialog-field .mdc-text-field__input,
      .spw-dialog-field .mat-mdc-input-element { color: #f1f5f9 !important; }
      .spw-dialog-field .mdc-floating-label { color: #94a3b8 !important; }
      .spw-dialog-field .mdc-notched-outline .mdc-notched-outline__outline { border-color: rgba(148, 163, 184, 0.5) !important; }
      .spw-dialog-field.mat-focused .mdc-notched-outline .mdc-notched-outline__outline,
      .spw-dialog-field .mdc-text-field--focused .mdc-notched-outline .mdc-notched-outline__outline { border-color: #22c55e !important; }
      .spw-dialog-field .mat-mdc-select-value { color: #f1f5f9 !important; }
      .spw-dialog-field .mat-hint { color: #94a3b8 !important; }
      .spw-dialog-checkbox {
        margin-top: 0.5rem;
        margin-bottom: 0.25rem;
      }
      .spw-dialog-checkbox .mdc-label { color: #e2e8f0 !important; }
      .spw-dialog-actions {
        padding: 1rem 1.5rem 1.25rem;
        border-top: 1px solid rgba(148, 163, 184, 0.15);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        flex-shrink: 0;
      }
      .spw-dialog-actions button:not(.spw-btn-primary) {
        color: #94a3b8;
      }
      .spw-dialog-actions button:not(.spw-btn-primary):hover {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.08);
      }
    `,
  ],
})
export class AccountFormDialogComponent implements OnInit, AfterViewInit {
  private accountsService = inject(AccountsService);
  private ref = inject(MatDialogRef<AccountFormDialogComponent>);
  private el = inject(ElementRef<HTMLElement>);
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

  ngOnInit(): void {
    this.ref.backdropClick().subscribe(() => this.closeDialog());
    this.ref.keydownEvents().pipe(filter((e) => e.key === 'Escape')).subscribe(() => this.closeDialog());
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
          this.closeDialog(true);
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
