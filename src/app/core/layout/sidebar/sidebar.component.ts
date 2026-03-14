import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <div class="spw-sidebar-logo">
      <a routerLink="/app/dashboard" class="spw-sidebar-logo-link" aria-label="SpendWise - Inicio" (click)="closeDrawer()">
        <img src="assets/logo-spendwise.png" alt="SpendWise" class="spw-sidebar-logo-img" />
      </a>
    </div>
    <nav class="spw-sidebar-nav">
      <a routerLink="/app/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="spw-nav-item" (click)="closeDrawer()">
        <mat-icon class="spw-nav-icon">dashboard</mat-icon>
        <span class="spw-nav-label">Dashboard</span>
      </a>
      <a routerLink="/app/accounts" routerLinkActive="active" class="spw-nav-item" (click)="closeDrawer()">
        <mat-icon class="spw-nav-icon">account_balance</mat-icon>
        <span class="spw-nav-label">Cuentas</span>
      </a>
      <a routerLink="/app/categories" routerLinkActive="active" class="spw-nav-item" (click)="closeDrawer()">
        <mat-icon class="spw-nav-icon">category</mat-icon>
        <span class="spw-nav-label">Categorías</span>
      </a>
      <a routerLink="/app/transactions" routerLinkActive="active" class="spw-nav-item" (click)="closeDrawer()">
        <mat-icon class="spw-nav-icon">receipt_long</mat-icon>
        <span class="spw-nav-label">Transacciones</span>
      </a>
    </nav>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .spw-sidebar-logo {
        flex-shrink: 0;
        padding: 0.75rem 0.5rem 0.75rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
      }
      .spw-sidebar-logo-link {
        display: block;
        width: 100%;
        max-width: 220px;
        height: 50px;
        overflow: hidden;
        margin: 0 auto;
        text-decoration: none;
      }
      .spw-sidebar-logo-img {
        height: 155px; /* imagen más alta que el contenedor */
        width: auto;
        display: block;
        transform: translateY(-45px); /* desplaza para recortar parte superior/inferior */
      }
      .spw-sidebar-nav {
        flex: 1;
        padding: 0.75rem 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
      }
      .spw-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 1rem;
        border-radius: 10px;
        color: #e2e8f0;
        text-decoration: none;
        font-size: 0.9375rem;
        transition: background 0.15s, color 0.15s;
        margin: 0 0.5rem;
      }
      .spw-nav-item:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #f1f5f9;
      }
      .spw-nav-item.active {
        background: rgba(34, 197, 94, 0.12);
        color: #4ade80;
        font-weight: 500;
      }
      .spw-nav-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
        color: #94a3b8;
        flex-shrink: 0;
      }
      .spw-nav-item.active .spw-nav-icon {
        color: #22c55e;
      }
      .spw-nav-label {
        white-space: nowrap;
      }
    `,
  ],
})
export class SidebarComponent {
  private layout = inject(LayoutService);

  closeDrawer(): void {
    this.layout.close();
  }
}
