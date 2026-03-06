import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-toolbar color="primary">
      <img src="assets/logo-spendwise.png" alt="SpendWise" class="spw-header-logo" width="140" height="40" />
      <span class="spw-toolbar-title">SpendWise</span>
      <span class="spw-spacer"></span>
      <button mat-icon-button routerLink="/app/dashboard" aria-label="Dashboard">
        <mat-icon>dashboard</mat-icon>
      </button>
      <button mat-icon-button (click)="logout()" aria-label="Cerrar sesión">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [
    `
      .spw-spacer { flex: 1 1 auto; }
      .spw-toolbar-title { font-weight: 600; letter-spacing: 0.02em; margin-left: 0.5rem; }
      .spw-header-logo { height: 40px; width: auto; display: block; }
    `,
  ],
})
export class HeaderComponent {
  constructor(private auth: AuthService) {}

  logout(): void {
    this.auth.logout().subscribe();
  }
}
