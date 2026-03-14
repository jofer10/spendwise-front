import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-toolbar class="spw-app-toolbar">
      <button
        mat-icon-button
        class="spw-toolbar-menu"
        aria-label="Abrir menú"
        (click)="openMenu()"
      >
        <mat-icon>menu</mat-icon>
      </button>
      <span class="spw-spacer"></span>
      <button mat-icon-button routerLink="/app/dashboard" aria-label="Dashboard" class="spw-toolbar-btn">
        <mat-icon>dashboard</mat-icon>
      </button>
      <button mat-icon-button (click)="logout()" aria-label="Cerrar sesión" class="spw-toolbar-btn">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [
    `
      .spw-app-toolbar {
        background: rgba(30, 41, 59, 0.98) !important;
        border-left: 1px solid rgba(148, 163, 184, 0.2);
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        color: #f1f5f9;
        height: 50px;
        min-height: 50px;
        max-height: 50px;
        flex-shrink: 0;
      }
      .spw-toolbar-menu {
        color: #94a3b8;
        margin-right: 0.25rem;
      }
      .spw-toolbar-menu:hover {
        color: #22c55e;
      }
      .spw-toolbar-menu mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      @media (min-width: 769px) {
        .spw-toolbar-menu {
          display: none;
        }
      }
      .spw-spacer { flex: 1 1 auto; }
      .spw-toolbar-btn { color: #94a3b8; }
      .spw-toolbar-btn:hover { color: #22c55e; }
      .spw-toolbar-btn mat-icon { font-size: 22px; width: 22px; height: 22px; }
    `,
  ],
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private layout = inject(LayoutService);

  openMenu(): void {
    this.layout.toggle();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
