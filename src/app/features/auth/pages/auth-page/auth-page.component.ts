import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

const GIRO_DURATION_MS = 700;
const GIRO_HALFWAY_MS = Math.round(GIRO_DURATION_MS / 2);

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './auth-page.component.html',
  host: { class: 'spw-auth-page' },
})
export class AuthPageComponent implements OnInit, OnDestroy {
  isFlipped = false;
  contentShowRegister = false;
  /** Activa la animación de giro (aplastar → cambiar contenido → abrir) */
  isGiroActive = false;

  private giroTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.syncFlipFromRoute();
    this.router.events.subscribe(() => this.syncFlipFromRoute());
  }

  ngOnDestroy(): void {
    if (this.giroTimeout != null) clearTimeout(this.giroTimeout);
  }

  private syncFlipFromRoute(): void {
    const register = this.router.url.includes('/auth/register');
    this.isFlipped = register;
    this.contentShowRegister = register;
  }

  flipToRegister(): void {
    if (this.isFlipped) return;
    this.isFlipped = true;
    this.router.navigate(['/auth/register']);
    this.runGiro(() => {
      this.contentShowRegister = true;
    });
  }

  flipToLogin(): void {
    if (!this.isFlipped) return;
    this.isFlipped = false;
    this.router.navigate(['/auth/login']);
    this.runGiro(() => {
      this.contentShowRegister = false;
    });
  }

  private runGiro(swapAtHalf: () => void): void {
    if (this.giroTimeout != null) clearTimeout(this.giroTimeout);
    this.isGiroActive = true;
    this.giroTimeout = setTimeout(() => {
      swapAtHalf();
      this.giroTimeout = setTimeout(() => {
        this.isGiroActive = false;
        this.giroTimeout = null;
      }, GIRO_HALFWAY_MS);
    }, GIRO_HALFWAY_MS);
  }
}
