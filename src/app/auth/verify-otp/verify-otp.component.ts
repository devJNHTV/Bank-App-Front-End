import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
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
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  isLoading = false;
  isResending = false;
  errorMessage = '';
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (isPlatformBrowser(this.platformId)) {
      this.email = localStorage.getItem('registerEmail');
    }
  }

  initForm(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  onOtpSubmit(): void {
    if (this.otpForm.invalid || !this.email) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { otp } = this.otpForm.value;

    this.authService.verifyOtp(this.email, otp).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  resendOtp(): void {
    if (!this.email) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.isResending = false;
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
        this.isResending = false;
      }
    });
  }
}