import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  host: { class: 'spw-auth-page' },
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.forgotPassword(this.form.getRawValue()).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.sent = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        const raw = err?.error;
        if (raw instanceof Blob) {
          raw.text().then((text) => {
            try {
              const body = JSON.parse(text) as { message?: string | string[] };
              const m = body?.message;
              this.error = Array.isArray(m) ? m[0] : (m ?? 'Error al enviar el correo.');
            } catch {
              this.error = 'Error al enviar el correo.';
            }
            this.cdr.markForCheck();
          });
          return;
        }
        const msg = err?.error?.message ?? err?.message;
        this.error = Array.isArray(msg) ? msg[0] : (msg || 'Error al enviar el correo.');
        this.cdr.markForCheck();
      },
    });
  }
}
