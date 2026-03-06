import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  done = false;
  error = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    this.form = this.fb.nonNullable.group({
      token: [this.token, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator]],
    });
  }

  ngOnInit(): void {
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get('password')?.value;
    if (!password || !control.value) return null;
    return password === control.value ? null : { passwordMismatch: true };
  };

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { token, password } = this.form.getRawValue();
    this.auth.resetPassword({ token, newPassword: password }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.done = true;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.error;
        this.error = (typeof msg === 'string' ? msg : 'Error al restablecer la contraseña.');
        this.cdr.markForCheck();
      },
    });
  }
}
