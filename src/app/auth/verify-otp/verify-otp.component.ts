import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegistrationService } from '../../core/services/registration.service';
import { PLATFORM_ID } from '@angular/core';
import Swal from 'sweetalert2';
import { StepperRegisterComponent } from '../stepper-register.component';

@Component({
  selector: 'app-verify-otp',
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
    MatProgressSpinnerModule,
    StepperRegisterComponent
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  isLoading = false;
  isResending = false;
  errorMessage: string | null = null;
  email: string | null = null;

  // Countdown properties
  countdown: number = 0;
  isCountdownActive: boolean = false;
  countdownInterval: any;
  canResendOtp: boolean = true;
  isRestoredFromStorage: boolean = false;

  // Storage keys
  private readonly COUNTDOWN_START_TIME_KEY = 'verify_otp_countdown_start_time';
  private readonly EMAIL_KEY = 'verify_otp_email';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      
      // Khôi phục email từ storage nếu không có trong params
      if (!this.email && isPlatformBrowser(this.platformId)) {
        this.email = localStorage.getItem(this.EMAIL_KEY);
      }
      
      if (!this.email) {
        this.errorMessage = 'Email không hợp lệ. Vui lòng quay lại bước KYC.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          timer: 3000,
        }).then(() => {
          this.router.navigate(['kyc-otp']);
        });
      } else {
        // Lưu email vào storage và khôi phục trạng thái countdown
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem(this.EMAIL_KEY, this.email);
          this.restoreCountdownState();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Khôi phục trạng thái đếm ngược từ sessionStorage
  private restoreCountdownState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

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

  // Lưu thời gian bắt đầu đếm ngược
  private saveCountdownStartTime(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const startTime = Date.now();
    sessionStorage.setItem(this.COUNTDOWN_START_TIME_KEY, startTime.toString());
  }

  // Xóa dữ liệu đếm ngược khỏi storage
  private clearCountdownStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    sessionStorage.removeItem(this.COUNTDOWN_START_TIME_KEY);
  }

  // Bắt đầu đếm ngược từ thời gian còn lại
  private startCountdownFromRemaining(): void {
    this.isCountdownActive = true;
    this.canResendOtp = false;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  // Bắt đầu đếm ngược mới
  private startCountdown(): void {
    this.countdown = 60; // 1 phút = 60 giây
    this.isCountdownActive = true;
    this.canResendOtp = false;
    this.isRestoredFromStorage = false;

    // Lưu thời gian bắt đầu đếm ngược
    this.saveCountdownStartTime();

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  // Dừng đếm ngược
  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdown = 0;
    this.isCountdownActive = false;
    this.canResendOtp = true;
    this.isRestoredFromStorage = false;
    
    // Xóa dữ liệu đếm ngược khỏi storage
    this.clearCountdownStorage();
  }

  // Format thời gian đếm ngược
  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onOtpSubmit(): void {
    if (this.otpForm.invalid || !this.email) {
      this.errorMessage = 'Vui lòng nhập mã OTP hợp lệ.';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: this.errorMessage,
        timer: 3000,
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { otp } = this.otpForm.value;

    this.registrationService.verifyOtp(this.email, otp).subscribe({
      next: () => {
        this.isLoading = false;
        
        // Xóa storage khi verify thành công
        this.clearCountdownStorage();
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.removeItem(this.EMAIL_KEY);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đăng ký hoàn tất! Vui lòng đăng nhập.',
          timer: 3000,
        }).then(() => {
          this.router.navigate(['login'], {
            queryParams: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' },
          });
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage || undefined,
          timer: 3000,
        });
      },
    });
  }

  resendOtp(): void {
    if (!this.email) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Email không hợp lệ',
        timer: 3000,
      });
      return;
    }

    if (!this.canResendOtp) {
      return;
    }

    this.isResending = true;
    this.errorMessage = null;

    this.registrationService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.isResending = false;
        
        // Bắt đầu đếm ngược sau khi gửi thành công
        this.startCountdown();
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Mã OTP đã được gửi lại!',
          timer: 3000,
        });
      },
      error: (error) => {
        this.isResending = false;

        const serverMessage = error?.error?.message || error?.message;
        this.errorMessage = serverMessage || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';

        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage || undefined,
          timer: 3000,
        });
      },
    });
  }

  back() {
    this.email = sessionStorage.getItem(this.EMAIL_KEY);
    this.router.navigate(['/kyc-otp'], { queryParams: { email: this.email } });
  }
}