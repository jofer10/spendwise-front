import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <mat-sidenav-container class="spw-shell-container">
      <mat-sidenav #drawer mode="side" opened class="spw-sidenav">
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content class="spw-sidenav-content">
        <app-header />
        <main class="spw-main">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .spw-shell-container { height: 100vh; }
      .spw-sidenav { width: 240px; }
      .spw-sidenav-content { display: flex; flex-direction: column; min-height: 100%; }
      .spw-main { flex: 1; padding: 1.5rem; }
    `,
  ],
})
export class ShellComponent {}
