import { Component, OnInit, Inject } from '@angular/core';
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
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  isLoading = false;
  isResending = false;
  errorMessage: string | null = null;
  email: string | null = null;

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
      }
    });
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
        text: "Email không hợp l",
        timer: 3000,
      });
      return;
    }

    this.isResending = true;
    this.errorMessage = null;

    this.registrationService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.isResending = false;
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
}