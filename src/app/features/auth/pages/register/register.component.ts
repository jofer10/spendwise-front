import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  @Output() loginClick = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.loading = true;
    this.error = '';
    this.auth.register({ fullName: name, email, password }).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => {
        window.location.href = '/app/dashboard';
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg[0] : (msg || 'Error al registrarse.');
        this.cdr.markForCheck();
      },
    });
  }
}
