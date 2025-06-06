import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { MustMatch } from '../must-match.validator';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
          NgIf,
          CommonModule,
          ReactiveFormsModule,
          RouterModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          MatProgressSpinnerModule
        ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  currentForm: string = 'forgotPassword';
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['test22@example.com', [Validators.required, Validators.email]]
    });
  }

  switchForm(form: string) {
    this.currentForm = form;
    this.isLoading = false;
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.resendVerificationCode(email).subscribe({
        next: () => {
          console.log('Gửi thành công');
        },
        error: (error) => {
          console.error('Lỗi gửi:', error);
          this.isLoading = false;
          this.errorMessage = error.message;
        }
      });

    }
  }

}
