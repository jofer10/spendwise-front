import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatNavList, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <nav mat-nav-list>
      <a mat-list-item routerLink="/app/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>
    </nav>
  `,
  styles: [
    `
      :host { display: block; padding: 0.5rem 0; }
      .active { background: rgba(255, 255, 255, 0.08); }
    `,
  ],
})
export class SidebarComponent {}
