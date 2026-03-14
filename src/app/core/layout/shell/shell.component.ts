import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LayoutService } from '../layout.service';

const SIDEBAR_BREAKPOINT = '(max-width: 768px)';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <mat-sidenav-container class="spw-shell-container">
      <mat-sidenav
        #drawer
        [mode]="sidenavMode()"
        [opened]="sidenavOpened()"
        class="spw-sidenav"
      >
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content class="spw-sidenav-content spw-sidenav-content--{{ sidenavMode() }}">
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
        max-width: 85vw;
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
        transition: margin-left 0.2s ease;
      }
      .spw-sidenav-content--side {
        margin-left: 260px;
      }
      .spw-sidenav-content--over {
        margin-left: 0;
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
      @media (max-width: 768px) {
        .spw-main-inner {
          padding: 1rem;
        }
      }
      @media (max-width: 480px) {
        .spw-main-inner {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;

  private breakpoint = inject(BreakpointObserver);
  private layout = inject(LayoutService);
  private destroy$ = new Subject<void>();

  isMobile = signal(false);
  sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));
  sidenavOpened = computed(() => !this.isMobile());

  ngAfterViewInit(): void {
    this.breakpoint
      .observe(SIDEBAR_BREAKPOINT)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
      });

    this.layout.onToggle.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.drawer?.toggle();
    });
    this.layout.onClose.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isMobile()) this.drawer?.close();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
