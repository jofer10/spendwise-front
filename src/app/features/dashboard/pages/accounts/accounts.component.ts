import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccountsService, ApiError, ACCOUNT_TYPES } from '../../../../core/api';
import type { Account } from '../../../../core/api';
import { AccountFormDialogComponent } from './index';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="spw-dashboard-page">
      <h1>Cuentas</h1>

      <div class="spw-card">
        <div class="spw-card-header">
          <h2 class="spw-card-title">Todas las cuentas</h2>
          <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            <span>Nueva cuenta</span>
          </button>
        </div>

        @if (loading) {
          <div class="spw-loading-wrap">
            <mat-spinner diameter="40"></mat-spinner>
            <span class="spw-loading-text">Cargando cuentas…</span>
          </div>
        } @else if (dataSource.data.length === 0) {
          <div class="spw-empty-state">
            <mat-icon>account_balance_wallet</mat-icon>
            <p class="spw-empty-title">Aún no hay cuentas</p>
            <p class="spw-empty-desc">No hay datos para mostrar. Crea tu primera cuenta para empezar a organizar tus finanzas.</p>
            <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
              <mat-icon>add</mat-icon>
              <span>Crear cuenta</span>
            </button>
          </div>
        } @else {
          <div class="spw-table-wrap">
            <table mat-table [dataSource]="dataSource">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let row">{{ typeLabel(row.type) }}</td>
              </ng-container>
              <ng-container matColumnDef="currency">
                <th mat-header-cell *matHeaderCellDef>Moneda</th>
                <td mat-cell *matCellDef="let row">{{ row.currency }}</td>
              </ng-container>
              <ng-container matColumnDef="initial_balance">
                <th mat-header-cell *matHeaderCellDef>Saldo inicial</th>
                <td mat-cell *matCellDef="let row">{{ row.initial_balance }}</td>
              </ng-container>
              <ng-container matColumnDef="is_default">
                <th mat-header-cell *matHeaderCellDef>Por defecto</th>
                <td mat-cell *matCellDef="let row">{{ row.is_default ? 'Sí' : '' }}</td>
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
        }
      </div>
    </div>
  `,
})
export class AccountsComponent implements OnInit {
  private accountsService = inject(AccountsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  dataSource = new MatTableDataSource<Account>([]);
  displayedColumns = ['name', 'type', 'currency', 'initial_balance', 'is_default', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.accountsService.list().pipe(
      timeout(15000),
      catchError((err) => {
        if (err.name === 'TimeoutError') {
          this.snackBar.open('No se pudo conectar. Comprueba que el servidor esté en marcha.', undefined, { duration: 5000 });
          return of([]);
        }
        throw err;
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        this.loading = false;
        this.dataSource.data = Array.isArray(list) ? list : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(err instanceof ApiError ? err.message : 'Error al cargar cuentas', undefined, { duration: 4000 });
      },
    });
  }

  typeLabel(type: string): string {
    const t = ACCOUNT_TYPES.find((x: { value: string; label: string }) => x.value === type);
    return t ? t.label : type;
  }

  openCreate(): void {
    const ref = this.dialog.open(AccountFormDialogComponent, {
      width: '420px',
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe((created) => {
      if (created) this.load();
    });
  }

  openEdit(account: Account): void {
    const ref = this.dialog.open(AccountFormDialogComponent, {
      width: '420px',
      data: { mode: 'edit', account },
    });
    ref.afterClosed().subscribe((updated) => {
      if (updated) this.load();
    });
  }

  confirmDelete(account: Account): void {
    if (!confirm(`¿Eliminar la cuenta "${account.name}"?`)) return;
    this.accountsService.delete(account.id).subscribe({
      next: () => {
        this.snackBar.open('Cuenta eliminada', undefined, { duration: 3000 });
        this.load();
      },
      error: (err) => {
        this.snackBar.open(err instanceof ApiError ? err.message : 'Error al eliminar', undefined, { duration: 4000 });
      },
    });
  }
}
