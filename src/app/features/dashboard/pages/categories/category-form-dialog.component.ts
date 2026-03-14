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
      <h2 class="spw-dialog-title">{{ data.mode === 'create' ? 'Nueva categoría' : 'Editar categoría' }}</h2>
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
            <mat-select name="kind" [(ngModel)]="model.kind" required panelClass="spw-select-panel">
              @for (opt of CATEGORY_KINDS; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Color (hex)</mat-label>
            <input matInput name="color" [(ngModel)]="model.color" placeholder="#FF5733" maxlength="20" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="spw-dialog-field">
            <mat-label>Icono</mat-label>
            <input matInput name="icon" [(ngModel)]="model.icon" placeholder="shopping-cart" maxlength="50" />
          </mat-form-field>
          <div class="spw-dialog-checkbox">
            <mat-checkbox name="is_active" [(ngModel)]="model.is_active">Activa</mat-checkbox>
          </div>
        </form>
      </div>
      <div class="spw-dialog-actions">
        <button mat-button type="button" (click)="close()">Cancelar</button>
        <button mat-flat-button color="primary" class="spw-btn-primary" [disabled]="saving || !model.name || !model.kind" (click)="submit()">
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
      .spw-dialog-checkbox { margin-top: 0.5rem; margin-bottom: 0.25rem; }
      .spw-dialog-actions {
        padding: 1rem 1.5rem 1.25rem; border-top: 1px solid rgba(148, 163, 184, 0.15);
        display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;
      }
      .spw-dialog-actions button:not(.spw-btn-primary) { color: #94a3b8; }
      .spw-dialog-actions button:not(.spw-btn-primary):hover { color: #22c55e; background: rgba(34, 197, 94, 0.08); }
    `,
  ],
})
export class CategoryFormDialogComponent implements OnInit, AfterViewInit {
  private categoriesService = inject(CategoriesService);
  private ref = inject(MatDialogRef<CategoryFormDialogComponent>);
  private el = inject(ElementRef<HTMLElement>);
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
          this.closeDialog(true);
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
