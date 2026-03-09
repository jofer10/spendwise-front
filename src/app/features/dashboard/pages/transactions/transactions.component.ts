import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TransactionsService, AccountsService, CategoriesService } from '../../../../core/api';
import { ApiError } from '../../../../core/api';
import type { Transaction } from '../../../../core/api';
import type { Account } from '../../../../core/api';
import type { Category } from '../../../../core/api';
import type { TransactionsListParams } from '../../../../core/api';
import { TXN_TYPES } from '../../../../core/api';
import { TransactionFormDialogComponent } from './index';

const SPW_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SPW_DATE_FORMATS }],
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="spw-dashboard-page">
      <h1>Transacciones</h1>

      <div class="spw-card">
        <div class="spw-card-header">
          <h2 class="spw-card-title">Listado</h2>
          <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            <span>Nueva transacción</span>
          </button>
        </div>

        <div class="spw-filters">
          <div class="spw-date-field-wrap">
            <mat-form-field appearance="outline" class="spw-filter-field spw-date-filter-field" floatLabel="always" [class.spw-has-date-error]="dateFromError">
              <mat-label>Desde</mat-label>
              <input matInput type="text" [(ngModel)]="dateFromDisplay" (ngModelChange)="onDateFromInput($event)" (keydown)="onDateKeydown($event)" (blur)="onDateFromBlur()" placeholder="dd/mm/aaaa" inputmode="numeric" />
              <mat-datepicker-toggle matSuffix [for]="pickerFrom">
                <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
              </mat-datepicker-toggle>
            </mat-form-field>
            @if (dateFromError) {
              <span class="spw-date-error-msg">{{ dateFromError }}</span>
            }
          </div>
          <div class="spw-datepicker-anchor">
            <input matInput [matDatepicker]="pickerFrom" [ngModel]="dateFromPickerValue" (ngModelChange)="onDateFromPicker($event)" class="spw-datepicker-hidden" tabindex="-1" aria-hidden="true" />
            <mat-datepicker #pickerFrom (opened)="onDatePickerFromOpened()" (closed)="onDatePickerFromClosed()"></mat-datepicker>
          </div>
          <div class="spw-date-field-wrap">
            <mat-form-field appearance="outline" class="spw-filter-field spw-date-filter-field" floatLabel="always" [class.spw-has-date-error]="dateToError">
              <mat-label>Hasta</mat-label>
              <input matInput type="text" [(ngModel)]="dateToDisplay" (ngModelChange)="onDateToInput($event)" (keydown)="onDateKeydown($event)" (blur)="onDateToBlur()" placeholder="dd/mm/aaaa" inputmode="numeric" />
              <mat-datepicker-toggle matSuffix [for]="pickerTo">
                <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
              </mat-datepicker-toggle>
            </mat-form-field>
            @if (dateToError) {
              <span class="spw-date-error-msg">{{ dateToError }}</span>
            }
          </div>
          <div class="spw-datepicker-anchor">
            <input matInput [matDatepicker]="pickerTo" [ngModel]="dateToPickerValue" (ngModelChange)="onDateToPicker($event)" class="spw-datepicker-hidden" tabindex="-1" aria-hidden="true" />
            <mat-datepicker #pickerTo (opened)="onDatePickerToOpened()" (closed)="onDatePickerToClosed()"></mat-datepicker>
          </div>
          <mat-form-field appearance="outline" class="spw-filter-field">
            <mat-label>Tipo</mat-label>
            <mat-select panelClass="spw-select-panel" [(ngModel)]="filters.type" (ngModelChange)="onFilterChange()">
              <mat-option value="">Todos</mat-option>
              @for (opt of TXN_TYPES; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-filter-field">
            <mat-label>Cuenta</mat-label>
            <mat-select panelClass="spw-select-panel" [(ngModel)]="filters.account_id" (ngModelChange)="onFilterChange()">
              <mat-option value="">Todas</mat-option>
              @for (a of accounts; track a.id) {
                <mat-option [value]="a.id">{{ a.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-filter-field">
            <mat-label>Categoría</mat-label>
            <mat-select panelClass="spw-select-panel" [(ngModel)]="filters.category_id" (ngModelChange)="onFilterChange()">
              <mat-option value="">Todas</mat-option>
              @for (c of categories; track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div class="spw-loading-wrap">
            <mat-spinner diameter="40"></mat-spinner>
            <span class="spw-loading-text">Cargando transacciones…</span>
          </div>
        } @else if (dataSource.data.length === 0) {
          <div class="spw-empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p class="spw-empty-title">Aún no hay transacciones</p>
            <p class="spw-empty-desc">No hay datos para mostrar. Registra tu primera transacción o ajusta los filtros.</p>
            <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
              <mat-icon>add</mat-icon>
              <span>Crear transacción</span>
            </button>
          </div>
        } @else {
          <div class="spw-table-wrap">
            <table mat-table [dataSource]="dataSource">
              <ng-container matColumnDef="transaction_date">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let row">{{ formatDate(row.transaction_date) }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let row">
                  <span [class.spw-txn-income]="row.type === 'INCOME'" [class.spw-txn-expense]="row.type === 'EXPENSE'">
                    {{ row.type === 'INCOME' ? 'Ingreso' : 'Gasto' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Monto</th>
                <td mat-cell *matCellDef="let row">
                  <span [class.spw-txn-income]="row.type === 'INCOME'" [class.spw-txn-expense]="row.type === 'EXPENSE'">
                    {{ row.type === 'INCOME' ? '+' : '-' }}{{ row.amount }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let row">{{ row.description || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="account">
                <th mat-header-cell *matHeaderCellDef>Cuenta</th>
                <td mat-cell *matCellDef="let row">{{ row.accounts?.name ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Categoría</th>
                <td mat-cell *matCellDef="let row">{{ row.categories?.name ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button (click)="openEdit(row)" aria-label="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="confirmDelete(row)" aria-label="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
          <div class="spw-pagination-wrap">
            <mat-paginator
              [length]="meta.total"
              [pageSize]="meta.limit"
              [pageIndex]="meta.page - 1"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPage($event)"
            >
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .spw-filters {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.25rem 1.5rem 1rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
      }
      .spw-filter-field { min-width: 140px; }
      .spw-date-field-wrap {
        display: flex;
        flex-direction: column;
        min-width: 140px;
      }
      .spw-date-error-msg {
        font-size: 0.75rem;
        color: #f87171;
        margin-top: -4px;
        margin-left: 0;
        line-height: 1.2;
      }
      .spw-datepicker-anchor {
        position: relative;
        width: 0;
        height: 0;
        overflow: hidden;
      }
      .spw-datepicker-hidden {
        position: absolute !important;
        width: 0 !important;
        height: 0 !important;
        min-width: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .spw-txn-income { color: #4ade80; font-weight: 600; }
      .spw-txn-expense { color: #f87171; font-weight: 600; }
      .spw-pagination-wrap { padding: 0.5rem 1.5rem; }
    `,
  ],
})
export class TransactionsComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private accountsService = inject(AccountsService);
  private categoriesService = inject(CategoriesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  loading = true;
  accounts: Account[] = [];
  categories: Category[] = [];
  dataSource = new MatTableDataSource<Transaction>([]);
  displayedColumns = ['transaction_date', 'type', 'amount', 'description', 'account', 'category', 'actions'];
  meta = { total: 0, page: 1, limit: 20, total_pages: 0 };
  filters: {
    date_from: string;
    date_to: string;
    type: string;
    account_id: string;
    category_id: string;
  } = {
    date_from: '',
    date_to: '',
    type: '',
    account_id: '',
    category_id: '',
  };

  TXN_TYPES = TXN_TYPES;

  /** Texto visible en los inputs (dd/mm/aaaa); el usuario escribe aquí sin parser que laggee. */
  dateFromDisplay = '';
  dateToDisplay = '';
  /** Mensaje de error de validación (se actualiza en cada cambio para que la vista lo muestre). */
  dateFromError: string | null = null;
  dateToError: string | null = null;
  /** Valores para el calendario (solo al abrir/cerrar y al elegir). */
  dateFromPickerValue: Date | null = null;
  dateToPickerValue: Date | null = null;

  /** Convierte yyyy-MM-dd → dd/mm/yyyy */
  private isoToDisplay(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return d && m && y ? `${d}/${m}/${y}` : '';
  }

  /** Formatea dd/mm/aaaa y añade / automático al completar día (2 dígitos) y mes (4 dígitos). */
  private formatDateInputAsYouType(value: string): string {
    const digits = (value ?? '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits.length === 2 ? `${digits}/` : digits;
    if (digits.length <= 4) return digits.length === 4 ? `${digits.slice(0, 2)}/${digits.slice(2)}/` : `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  private getDateDisplayError(display: string): string | null {
    const t = (display ?? '').trim();
    if (!t) return null;
    const digits = t.replace(/\D/g, '');
    if (digits.length >= 2) {
      const day = parseInt(digits.slice(0, 2), 10);
      if (day < 1 || day > 31) return 'Día debe ser entre 01 y 31.';
    }
    if (digits.length >= 4) {
      const month = parseInt(digits.slice(2, 4), 10);
      if (month < 1 || month > 12) return 'Mes debe ser entre 01 y 12.';
    }
    if (digits.length === 8) {
      if (!this.parseDateDDMMYYYY(display)) return 'Formato o fecha inválida. Use dd/mm/aaaa.';
    }
    return null;
  }

  /** Parsea dd/MM/yyyy a yyyy-MM-dd o null si no es válido */
  private parseDateDDMMYYYY(s: string): string | null {
    if (!s || typeof s !== 'string') return null;
    const trimmed = s.trim();
    const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10) - 1;
    const year = parseInt(y, 10);
    if (month < 0 || month > 11) return null;
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return date.toISOString().slice(0, 10);
  }

  /** Al salir del input, revalidar y forzar que se muestre el error si la fecha es inválida. */
  onDateFromBlur(): void {
    this.dateFromError = this.getDateDisplayError(this.dateFromDisplay);
    this.cdr.detectChanges();
  }

  onDateToBlur(): void {
    this.dateToError = this.getDateDisplayError(this.dateToDisplay);
    this.cdr.detectChanges();
  }

  /** Solo permite teclas numéricas y de control en los inputs de fecha. */
  onDateKeydown(e: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) {
      if (['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    }
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  /** Input de texto: solo dígitos (y / si se pega); dispara búsqueda solo al completar fecha o al borrar un valor existente. */
  onDateFromInput(value: string): void {
    const onlyDigits = (value ?? '').replace(/\D/g, '');
    const hadFilter = this.filters.date_from !== '';
    this.dateFromDisplay = this.formatDateInputAsYouType(onlyDigits);
    this.dateFromError = this.getDateDisplayError(this.dateFromDisplay);
    const parsed = this.parseDateDDMMYYYY(this.dateFromDisplay);
    this.filters.date_from = parsed ?? '';
    if (parsed) this.onFilterChange();
    else if (this.dateFromDisplay === '' && hadFilter) this.onFilterChange();
    this.cdr.markForCheck();
  }

  onDateToInput(value: string): void {
    const onlyDigits = (value ?? '').replace(/\D/g, '');
    const hadFilter = this.filters.date_to !== '';
    this.dateToDisplay = this.formatDateInputAsYouType(onlyDigits);
    this.dateToError = this.getDateDisplayError(this.dateToDisplay);
    const parsed = this.parseDateDDMMYYYY(this.dateToDisplay);
    this.filters.date_to = parsed ?? '';
    if (parsed) this.onFilterChange();
    else if (this.dateToDisplay === '' && hadFilter) this.onFilterChange();
    this.cdr.markForCheck();
  }

  /** Al elegir o borrar en el calendario (input oculto): actualizar display + filtro y buscar. */
  onDateFromPicker(value: Date | null): void {
    this.dateFromPickerValue = value;
    this.filters.date_from = value ? value.toISOString().slice(0, 10) : '';
    this.dateFromDisplay = value ? this.isoToDisplay(this.filters.date_from) : '';
    this.dateFromError = this.getDateDisplayError(this.dateFromDisplay);
    this.onFilterChange();
    this.cdr.markForCheck();
  }

  onDateToPicker(value: Date | null): void {
    this.dateToPickerValue = value;
    this.filters.date_to = value ? value.toISOString().slice(0, 10) : '';
    this.dateToDisplay = value ? this.isoToDisplay(this.filters.date_to) : '';
    this.dateToError = this.getDateDisplayError(this.dateToDisplay);
    this.onFilterChange();
    this.cdr.markForCheck();
  }

  onDatePickerFromOpened(): void {
    this.dateFromPickerValue = this.filters.date_from ? new Date(this.filters.date_from + 'T12:00:00') : null;
  }

  /** Solo cerrar; no disparar API si el usuario no eligió fecha. */
  onDatePickerFromClosed(): void {}

  onDatePickerToOpened(): void {
    this.dateToPickerValue = this.filters.date_to ? new Date(this.filters.date_to + 'T12:00:00') : null;
  }

  /** Solo cerrar; no disparar API si el usuario no eligió fecha. */
  onDatePickerToClosed(): void {}

  ngOnInit(): void {
    this.dateFromDisplay = this.isoToDisplay(this.filters.date_from);
    this.dateToDisplay = this.isoToDisplay(this.filters.date_to);
    this.accountsService.list().subscribe((list) => (this.accounts = list));
    this.categoriesService.list().subscribe((list) => (this.categories = list));
    this.load();
  }

  onFilterChange(): void {
    this.meta.page = 1;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.meta.page = e.pageIndex + 1;
    this.meta.limit = e.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const params: TransactionsListParams = {
      page: this.meta.page,
      limit: this.meta.limit,
    };
    if (this.filters.date_from) params.date_from = this.filters.date_from;
    if (this.filters.date_to) params.date_to = this.filters.date_to;
    if (this.filters.type) params.type = this.filters.type as TransactionsListParams['type'];
    if (this.filters.account_id) params.account_id = this.filters.account_id;
    if (this.filters.category_id) params.category_id = this.filters.category_id;

    this.transactionsService.list(params).pipe(
      timeout(15000),
      catchError((err) => {
        if (err.name === 'TimeoutError') {
          this.snackBar.open('No se pudo conectar. Comprueba que el servidor esté en marcha.', undefined, { duration: 5000 });
          return of({ data: [], meta: { total: 0, page: 1, limit: this.meta.limit, total_pages: 0 } });
        }
        throw err;
      }),
      finalize(() => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.dataSource.data = Array.isArray(res.data) ? res.data : [];
          this.meta = { ...res.meta };
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(err instanceof ApiError ? err.message : 'Error al cargar transacciones', undefined, { duration: 4000 });
        });
      },
    });
  }

  formatDate(s: string): string {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  openCreate(): void {
    const ref = this.dialog.open(TransactionFormDialogComponent, {
      width: '480px',
      data: { mode: 'create', accounts: this.accounts, categories: this.categories },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  openEdit(txn: Transaction): void {
    const ref = this.dialog.open(TransactionFormDialogComponent, {
      width: '480px',
      data: { mode: 'edit', transaction: txn, accounts: this.accounts, categories: this.categories },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  confirmDelete(txn: Transaction): void {
    if (!confirm('¿Eliminar esta transacción?')) return;
    this.transactionsService.delete(txn.id).subscribe({
      next: () => {
        this.snackBar.open('Transacción eliminada', undefined, { duration: 3000 });
        this.load();
      },
      error: (err) => {
        this.snackBar.open(err instanceof ApiError ? err.message : 'Error al eliminar', undefined, { duration: 4000 });
      },
    });
  }
}
