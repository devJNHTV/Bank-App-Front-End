import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-step3-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: './step3-otp.component.html',
  styleUrl: './step3-otp.component.scss',
  providers: [MessageService]
})
export class Step3OtpComponent implements OnInit, OnDestroy {
  @Input() transactionId: string = '';
  @Output() otpSubmit = new EventEmitter<{savingRequestID: string, otpCode: string}>();
  @Output() backToPrevious = new EventEmitter<void>();
  @Output() resendOtp = new EventEmitter<string>();

  otpCode: string = '';
  isLoading: boolean = false;
  countdown: number = 120; // 2 minutes countdown
  canResend: boolean = false;
  private countdownInterval: any;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown() {
    this.canResend = false;
    this.countdown = 120;
    
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onOtpInput(event: any) {
    // Chỉ cho phép số và giới hạn 6 ký tự
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    this.otpCode = value;
    event.target.value = value;
  }

  onSubmitOtp() {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng nhập đầy đủ 6 số OTP'
      });
      return;
    }

    if (!this.transactionId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không tìm thấy mã giao dịch'
      });
      return;
    }

    this.isLoading = true;
    this.otpSubmit.emit({
      savingRequestID: this.transactionId,
      otpCode: this.otpCode
    });
  }

  onResendOtp() {
    if (!this.canResend) return;
    
    this.resendOtp.emit(this.transactionId);
    this.startCountdown();
    // Clear OTP cũ khi gửi lại
    this.otpCode = '';
  }

  onBack() {
    this.backToPrevious.emit();
  }

  // Reset loading state (được gọi từ parent component)
  resetLoading() {
    this.isLoading = false;
  }

  // Show error message (được gọi từ parent component)
  showError(message: string) {
    this.isLoading = false;
    // Clear OTP khi có lỗi để user nhập lại
    this.otpCode = '';
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi xác thực',
      detail: message
    });
  }

  // Show success message (được gọi từ parent component)
  showSuccess(message: string) {
    this.isLoading = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: message
    });
  }
} 