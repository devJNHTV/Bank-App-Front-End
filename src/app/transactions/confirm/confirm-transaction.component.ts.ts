import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-confirm-transaction',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    InputOtpModule,
  ],
  templateUrl: './confirm-transaction.component.html',
  styleUrls: ['./confirm-transaction.component.scss'],
})
export class ConfirmTransactionComponent {
  @Input() transferData: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
  } = {
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: 0,
    description: '',
  };

  otpCode: string = '';

  onConfirm() {
    console.log('Xác nhận chuyển khoản:', this.transferData);
    console.log('OTP đã nhập:', this.otpCode);
    // Gọi service xác thực OTP ở đây
  }

  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }
}
