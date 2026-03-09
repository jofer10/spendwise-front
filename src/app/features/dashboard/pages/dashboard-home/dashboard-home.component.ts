import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountsService } from '../../../../core/api';
import type { Account } from '../../../../core/api';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="spw-dashboard-page">
      <h1>Dashboard</h1>

      @if (loading) {
        <div class="spw-loading-wrap">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="spw-loading-text">Cargando…</span>
        </div>
      } @else {
        <section class="spw-hero-cards">
          <div class="spw-stat-card spw-card">
            <div class="spw-stat-label">Balance total</div>
            <div class="spw-stat-value">{{ totalBalance }}</div>
            <div class="spw-stat-hint">{{ accounts.length }} cuenta(s)</div>
          </div>
        </section>

        <section class="spw-quick-links">
          <h2 class="spw-section-title">Acceso rápido</h2>
          <div class="spw-quick-grid">
            <a routerLink="/app/accounts" class="spw-quick-link">
              <mat-icon>account_balance</mat-icon>
              <div>
                <strong>Cuentas</strong>
                <span class="spw-quick-desc">Gestiona tus cuentas y saldos</span>
              </div>
            </a>
            <a routerLink="/app/categories" class="spw-quick-link">
              <mat-icon>category</mat-icon>
              <div>
                <strong>Categorías</strong>
                <span class="spw-quick-desc">Ingresos, gastos y etiquetas</span>
              </div>
            </a>
            <a routerLink="/app/transactions" class="spw-quick-link">
              <mat-icon>receipt_long</mat-icon>
              <div>
                <strong>Transacciones</strong>
                <span class="spw-quick-desc">Registro y filtros</span>
              </div>
            </a>
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .spw-hero-cards { margin-bottom: 2rem; }
      .spw-stat-card {
        padding: 1.5rem;
        max-width: 360px;
      }
      .spw-stat-label {
        font-size: 0.875rem;
        color: #94a3b8;
        margin-bottom: 0.25rem;
      }
      .spw-stat-value { margin-bottom: 0.25rem; }
      .spw-stat-hint { font-size: 0.8125rem; color: #64748b; }
      .spw-section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #94a3b8;
        margin: 0 0 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .spw-quick-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .spw-quick-link strong { display: block; color: #f1f5f9; margin-bottom: 0.25rem; }
      .spw-quick-desc { font-size: 0.875rem; color: #94a3b8; }
    `,
  ],
})
export class DashboardHomeComponent implements OnInit {
  loading = true;
  accounts: Account[] = [];
  totalBalance = '0.00';

  constructor(private accountsService: AccountsService) {}

  ngOnInit(): void {
    this.accountsService.list().subscribe({
      next: (list) => {
        this.accounts = list;
        const total = list.reduce((sum, a) => sum + parseFloat(a.initial_balance || '0'), 0);
        this.totalBalance = total.toFixed(2);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
