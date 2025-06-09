import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { MustMatch } from '../must-match.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Token không hợp lệ hoặc đã hết hạn.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/forgot-password']);
        });
      }
    });
  }

  initForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['290801Bin@', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['290801Bin@', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Lỗi',
        text: 'Vui lòng nhập mật khẩu hợp lệ và khớp với xác nhận mật khẩu!',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { password, confirmPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.token, password, confirmPassword).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Mật khẩu đã được đặt lại thành công!',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error: { message?: string }) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }
}