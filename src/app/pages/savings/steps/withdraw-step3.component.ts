import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-withdraw-step3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule
  ],
  template: `
    <p-card header="Xác thực OTP">
      <div class="otp-container">
        <div class="otp-header">
          <i class="pi pi-shield"></i>
          <h3>Xác thực giao dịch</h3>
          <p>Vui lòng nhập mã OTP đã được gửi đến email  để hoàn tất giao dịch rút tiền.</p>
        </div>

        <!-- Error message section -->
        <div class="error-message" *ngIf="errorMessage">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success message section -->
        <div class="success-message" *ngIf="successMessage">
          <i class="pi pi-check-circle"></i>
          <span>{{ successMessage }}</span>
        </div>

        <form #otpForm="ngForm" (ngSubmit)="onSubmit(otpForm)">
          <div class="form-field">
            <label class="form-label">Mã OTP <span class="required">*</span></label>
            <input
              type="text"
              name="otpCode"
              [(ngModel)]="otpCode"
              #otpInput="ngModel"
              required
              pattern="[0-9]{6}"
              maxlength="6"
              placeholder="Nhập mã OTP"
              class="otp-input"
              autocomplete="one-time-code"
              (input)="clearMessages(); formatOtpInput($event)">
            
            <small class="form-error" *ngIf="otpInput.invalid && otpInput.touched">
              <span *ngIf="otpInput.errors?.['required']">Vui lòng nhập mã OTP</span>
              <span *ngIf="otpInput.errors?.['pattern']">Mã OTP phải là 6 chữ số</span>
            </small>
          </div>

          <div class="countdown-section" *ngIf="countdown > 0">
            <p class="countdown-text">
              Mã OTP sẽ hết hiệu lực sau: <span class="countdown">{{ formatTime(countdown) }}</span>
            </p>
          </div>

          <div class="resend-section" *ngIf="countdown === 0">
            <p class="expired-text">Mã OTP đã hết hiệu lực</p>
            <button 
              type="button"
              pButton 
              label="Gửi lại mã OTP" 
              icon="pi pi-refresh"
              class="p-button-link"
              (click)="onResendOtp()">
            </button>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              pButton 
              label="Quay lại" 
              icon="pi pi-arrow-left"
              class="p-button-secondary"
              (click)="onBack()">
            </button>
            
            <button 
              type="submit" 
              pButton 
              label="Xác nhận" 
              icon="pi pi-check"
              iconPos="right"
              class="p-button"
              [disabled]="!otpForm.valid || countdown === 0 || isLoading || otpCode.length !== 6"
              [loading]="isLoading">
            </button>
          </div>
        </form>

        <div class="help-section">
          <h4>Không nhận được mã OTP?</h4>
          <ul>
            <li>Kiểm tra tin nhắn trong hộp thư rác</li>
            <li>Đảm bảo điện thoại có sóng tốt</li>
            <li>Liên hệ hotline: 1900-xxx-xxx để được hỗ trợ</li>
          </ul>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    .otp-container {
      max-width: 500px;
      margin: 0 auto;
      text-align: center;
    }

    .otp-header {
      margin-bottom: 2rem;
    }

    .otp-header i {
      font-size: 3rem;
      color: #007bff;
      margin-bottom: 1rem;
    }

    .otp-header h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .otp-header p {
      color: #666;
      line-height: 1.6;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-message i {
      font-size: 1.2rem;
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .success-message i {
      font-size: 1.2rem;
    }

    .form-field {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .required {
      color: #e74c3c;
    }

    .otp-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 1.5rem;
      text-align: center;
      letter-spacing: 0.6rem;
      border: 2px solid #dee2e6;
      border-radius: 4px;
      background-color: #fff;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .otp-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .otp-input.ng-invalid.ng-touched {
      border-color: #dc3545;
    }

    .otp-input.ng-valid.ng-touched {
      border-color: #28a745;
    }

    .form-error {
      color: #e74c3c;
      margin-top: 0.25rem;
      display: block;
    }

    .countdown-section {
      margin: 1rem 0;
    }

    .countdown-text {
      color: #666;
      margin: 0;
    }

    .countdown {
      color: #007bff;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .resend-section {
      margin: 1rem 0;
    }

    .expired-text {
      color: #e74c3c;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .help-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
      text-align: left;
    }

    .help-section h4 {
      color: #333;
      margin-bottom: 1rem;
    }

    .help-section ul {
      color: #666;
      padding-left: 1.5rem;
    }

    .help-section li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class WithdrawStep3Component implements OnInit, OnDestroy {
  @Input() transactionId: string = '';
  @Output() otpSubmit = new EventEmitter<{transactionId: string, otpCode: string}>();
  @Output() backToPrevious = new EventEmitter<void>();
  @Output() resendOtp = new EventEmitter<string>();

  otpCode: string = '';
  countdown: number = 120; // 2 minutes in seconds
  private countdownInterval: any;
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor() {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatOtpInput(event: any) {
    // Only allow numbers
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.otpCode = value;
  }

  onSubmit(form: any) {
    if (form.valid && this.countdown > 0 && this.otpCode.length === 6) {
      this.isLoading = true;
      this.clearMessages();
      
      this.otpSubmit.emit({
        transactionId: this.transactionId,
        otpCode: this.otpCode
      });
    } else {
      if (this.countdown === 0) {
        this.showError('Mã OTP đã hết hiệu lực. Vui lòng gửi lại mã mới.');
      } else if (this.otpCode.length !== 6) {
        this.showError('Vui lòng nhập đầy đủ 6 chữ số OTP.');
      }
    }
  }

  onBack() {
    this.backToPrevious.emit();
  }

  onResendOtp() {
    this.isLoading = true;
    this.resendOtp.emit(this.transactionId);
    this.countdown = 300; // Reset countdown
    this.startCountdown();
    this.otpCode = '';
    this.clearMessages();
    this.showSuccess('Mã OTP mới đã được gửi đến số điện thoại của bạn.');
    this.isLoading = false;
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    this.isLoading = false;
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    this.isLoading = false;
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Method to handle OTP verification result from parent component
  handleOtpResult(success: boolean, message: string) {
    this.isLoading = false;
    if (success) {
      this.showSuccess(message);
    } else {
      this.showError(message);
      // Reset OTP input on error
      this.otpCode = '';
    }
  }
} 