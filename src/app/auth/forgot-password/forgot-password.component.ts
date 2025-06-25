import { Component, OnDestroy } from '@angular/core';
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
export class ForgotPasswordComponent implements OnDestroy {
  currentForm: string = 'forgotPassword';
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Countdown properties
  countdown: number = 0;
  isCountdownActive: boolean = false;
  countdownInterval: any;
  canResendOtp: boolean = true;
  isRestoredFromStorage: boolean = false;

  private readonly COUNTDOWN_KEY = 'forgot_password_countdown';
  private readonly COUNTDOWN_START_TIME_KEY = 'forgot_password_start_time';
  private readonly EMAIL_KEY = 'forgot_password_email';

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordService,
    private router: Router
  ) {
    const savedEmail = sessionStorage.getItem(this.EMAIL_KEY) || 'test22@example.com';
    
    this.forgotPasswordForm = this.fb.group({
      email: [savedEmail, [Validators.required, Validators.email]]
    });
    
    // Khôi phục trạng thái đếm ngược khi component khởi tạo
    this.restoreCountdownState();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Khôi phục trạng thái đếm ngược từ sessionStorage
  private restoreCountdownState() {
    const startTimeStr = sessionStorage.getItem(this.COUNTDOWN_START_TIME_KEY);
    
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr, 10);
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const remainingTime = 60 - elapsedSeconds;

      if (remainingTime > 0) {
        // Vẫn còn thời gian đếm ngược
        this.countdown = remainingTime;
        this.isRestoredFromStorage = true;
        this.startCountdownFromRemaining();
      } else {
        // Hết thời gian đếm ngược
        this.clearCountdownStorage();
        this.canResendOtp = true;
      }
    }
  }

  // Lưu thời gian bắt đầu đếm ngược và email
  private saveCountdownStartTime() {
    const startTime = Date.now();
    const email = this.forgotPasswordForm.get('email')?.value;
    
    sessionStorage.setItem(this.COUNTDOWN_START_TIME_KEY, startTime.toString());
    sessionStorage.setItem(this.EMAIL_KEY, email);
  }

  // Xóa dữ liệu đếm ngược khỏi storage
  private clearCountdownStorage() {
    sessionStorage.removeItem(this.COUNTDOWN_KEY);
    sessionStorage.removeItem(this.COUNTDOWN_START_TIME_KEY);
    sessionStorage.removeItem(this.EMAIL_KEY);
  }

  // Bắt đầu đếm ngược từ thời gian còn lại
  private startCountdownFromRemaining() {
    this.isCountdownActive = true;
    this.canResendOtp = false;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  switchForm(form: string) {
    this.currentForm = form;
    this.isLoading = false;
  }

  startCountdown() {
    this.countdown = 60; // 1 phút = 60 giây
    this.isCountdownActive = true;
    this.canResendOtp = false;

    // Lưu thời gian bắt đầu đếm ngược
    this.saveCountdownStartTime();

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdown = 0;
    this.isCountdownActive = false;
    this.canResendOtp = true;
    
    // Xóa dữ liệu đếm ngược khỏi storage
    this.clearCountdownStorage();
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const email = this.forgotPasswordForm.get('email')?.value;

      this.passwordService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Bắt đầu đếm ngược sau khi gửi thành công
          this.startCountdown();
          
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: response?.data?.message || 'Mã xác nhận đã được gửi đến email của bạn!',
            confirmButtonText: 'OK'
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

  onResendOtp() {
    if (this.canResendOtp && !this.isLoading) {
      this.onForgotPasswordSubmit();
    }
  }
}