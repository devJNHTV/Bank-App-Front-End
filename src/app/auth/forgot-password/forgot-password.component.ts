import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { Password } from 'primeng/password';
import { PasswordService } from '../../core/services/password.service';
import { RegistrationService } from '../../core/services/registration.service';

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
    private registrationService: RegistrationService,
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

      this.registrationService.resendVerificationCode(email).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Mã xác nhận đã được gửi đến email của bạn!',
            confirmButtonText: 'OK'
          }).then(() => {
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Đã có lỗi xảy ra, vui lòng thử lại!',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Lỗi',
        text: 'Vui lòng nhập email hợp lệ!',
        confirmButtonText: 'OK'
      });
    }
  }
}