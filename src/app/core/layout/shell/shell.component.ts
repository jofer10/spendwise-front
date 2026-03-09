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
          <div class="spw-main-inner">
            <router-outlet />
          </div>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .spw-shell-container {
        height: 100vh;
        background: #0f172a;
        box-sizing: border-box;
      }
      .spw-shell-container .mat-drawer-container {
        background: #0f172a;
      }
      .spw-sidenav {
        width: 260px;
        min-width: 260px;
        top: 0 !important;
        border-right: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      .spw-sidenav-content {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        height: 100%;
        background: #0f172a;
        overflow: hidden;
        position: relative;
        z-index: 0;
        margin-left: 260px;
      }
      .spw-main {
        flex: 1;
        min-height: 0;
        overflow: auto;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        padding: 0;
        background: transparent;
      }
      .spw-main-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.75rem 2rem;
        box-sizing: border-box;
      }
    `,
  ],
})
export class ShellComponent {}
