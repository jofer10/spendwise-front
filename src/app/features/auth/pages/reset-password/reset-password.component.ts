import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  host: { class: 'spw-auth-page' },
})
export class ResetPasswordComponent {
  form: FormGroup;
  loading = false;
  done = false;
  error = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    this.form = this.fb.nonNullable.group({
      token: [this.token, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.done = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Error al restablecer la contraseña.';
      },
    });
  }
}
