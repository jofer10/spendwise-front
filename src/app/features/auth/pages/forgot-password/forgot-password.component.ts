import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private auth: AuthService
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Error al enviar el correo.';
      },
    });
  }
}
