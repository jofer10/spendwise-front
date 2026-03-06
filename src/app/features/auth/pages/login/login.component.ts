import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
})
export class LoginComponent {
  @Output() registerClick = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.getRawValue()).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => {
        window.location.href = '/app/dashboard';
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg[0] : (msg || 'Error al iniciar sesión.');
      },
    });
  }
}
