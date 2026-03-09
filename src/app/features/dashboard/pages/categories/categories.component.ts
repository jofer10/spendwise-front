import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriesService, ApiError, CATEGORY_KINDS } from '../../../../core/api';
import type { Category } from '../../../../core/api';
import { CategoryFormDialogComponent } from './index';

@Component({
  selector: 'app-categories',
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
      <h1>Categorías</h1>

      <div class="spw-card">
        <div class="spw-card-header">
          <h2 class="spw-card-title">Todas las categorías</h2>
          <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
            <mat-icon>add</mat-icon>
            <span>Nueva categoría</span>
          </button>
        </div>

        @if (loading) {
          <div class="spw-loading-wrap">
            <mat-spinner diameter="40"></mat-spinner>
            <span class="spw-loading-text">Cargando categorías…</span>
          </div>
        } @else if (dataSource.data.length === 0) {
          <div class="spw-empty-state">
            <mat-icon>category</mat-icon>
            <p class="spw-empty-title">Aún no hay categorías</p>
            <p class="spw-empty-desc">No hay datos para mostrar. Crea tu primera categoría para organizar ingresos y gastos.</p>
            <button mat-flat-button color="primary" class="spw-btn-primary spw-btn-with-icon" (click)="openCreate()">
              <mat-icon>add</mat-icon>
              <span>Crear categoría</span>
            </button>
          </div>
        } @else {
          <div class="spw-table-wrap">
            <table mat-table [dataSource]="dataSource">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>
              <ng-container matColumnDef="kind">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let row">{{ kindLabel(row.kind) }}</td>
              </ng-container>
              <ng-container matColumnDef="color">
                <th mat-header-cell *matHeaderCellDef>Color</th>
                <td mat-cell *matCellDef="let row">
                  <span class="spw-color-dot" [style.background]="row.color || '#94a3b8'"></span>
                  {{ row.color || '—' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="icon">
                <th mat-header-cell *matHeaderCellDef>Icono</th>
                <td mat-cell *matCellDef="let row">{{ row.icon || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="is_active">
                <th mat-header-cell *matHeaderCellDef>Activa</th>
                <td mat-cell *matCellDef="let row">{{ row.is_active ? 'Sí' : 'No' }}</td>
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
  styles: [
    `
      .spw-color-dot {
        display: inline-block;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin-right: 0.5rem;
        vertical-align: middle;
      }
    `,
  ],
})
export class CategoriesComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns = ['name', 'kind', 'color', 'icon', 'is_active', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  kindLabel(kind: string): string {
    const k = CATEGORY_KINDS.find((x) => x.value === kind);
    return k ? k.label : kind;
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.categoriesService.list().pipe(
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
        this.snackBar.open(err instanceof ApiError ? err.message : 'Error al cargar categorías', undefined, { duration: 4000 });
      },
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '420px',
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  openEdit(category: Category): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '420px',
      data: { mode: 'edit', category },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  confirmDelete(category: Category): void {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.categoriesService.delete(category.id).subscribe({
      next: () => {
        this.snackBar.open('Categoría eliminada', undefined, { duration: 3000 });
        this.load();
      },
      error: (err) => {
        this.snackBar.open(err instanceof ApiError ? err.message : 'Error al eliminar', undefined, { duration: 4000 });
      },
    });
  }
}
