import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { TransactionService } from '../../services/transaction.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { TransactionResultComponent } from '../results/transaction-result.component';

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
    ToastModule,
    TransactionResultComponent
  ],
  templateUrl: './confirm-transaction.component.html',
  styleUrls: ['./confirm-transaction.component.scss'],
  providers: [TransactionService, MessageService]
})
export class ConfirmTransactionComponent {
  constructor(private transactionService: TransactionService,
     private messageService: MessageService,private router: Router ) {}
  @Input() transferData: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
    referenceCode?: string;
    fromCustomerName: string | null;
    toCustomerName: string | null;
  } = {
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: 0,
    description: '',
    referenceCode: '',
    fromCustomerName: '',
    toCustomerName: '',
  };

  otpCode: string = '';
  confirmTransactionRequest: any = {
    referenceCode: '',
    otpCode: '',
  };
  resendOtpRequest: any = {
    referenceCode: '',
    accountNumberRecipient: '',
  };
  onConfirm() {
    this.confirmTransactionRequest.referenceCode = this.transferData.referenceCode;
    this.confirmTransactionRequest.otpCode = this.otpCode;
    this.transactionService.confirmTransaction(this.confirmTransactionRequest).subscribe({
      next: (res) => {
        console.log('Phản hồi từ server:', res);
        const result = res.result;
        const isSuccess = result?.status === 'COMPLETED';
        if (isSuccess) {
          this.showSuccess('Giao dịch chuyển khoản đã xác nhận thành công.');
        } else {
          this.showError('Giao dịch không thành công: ' + res.message);
        }
        this.router.navigate(['/transaction-result'], {
          state: {
            success: isSuccess,
            transactionData: result,
            fromCustomerName: this.transferData.fromCustomerName,
            toCustomerName: this.transferData.toCustomerName
          }
        });
      },
      error: (err) => {
        console.error('Lỗi khi xác thực OTP:', err);
        const result = err.error?.result;
        const message = err.error?.message || 'Xác nhận giao dịch thất bại';
        const isSuccess = result?.status === 'COMPLETED';
        this.showError('Xác nhận giao dịch thất bại: ' + message);
        if(result?.status==='FAILED'){
          this.router.navigate(['/transaction-result'], {
            state: {
              success: isSuccess,
              transactionData: result,  
              fromCustomerName: this.transferData.fromCustomerName,
              toCustomerName: this.transferData.toCustomerName
            }
          });
        }
      }
    });
  }

  @Output() cancel = new EventEmitter<void>();
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: message,
    });
  }
  
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: message,
    });
  }
  isResendDisabled = false;
resendCountdown: number = 0;
resendInterval: any;
  onResendOtp() {
    this.resendOtpRequest.referenceCode = this.transferData.referenceCode;
    this.resendOtpRequest.accountNumberRecipient = this.transferData.toAccountNumber;
    console.log('Gửi lại mã OTP',this.resendOtpRequest);
    this.transactionService.resendOtp(this.resendOtpRequest).subscribe({
      next: (res) => {
        console.log('Phản hồi từ server:', res);
        this.showSuccess('Mã OTP đã được gửi lại thành công.');
      },
      error: (err) => {
        console.error('Lỗi khi gửi lại mã OTP:', err);
        this.showError('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
      }
    });
    this.isResendDisabled = true;
  this.resendCountdown = 30;

  this.resendInterval = setInterval(() => {
    this.resendCountdown--;
    if (this.resendCountdown <= 0) {
      clearInterval(this.resendInterval);
      this.isResendDisabled = false;
    }
  }, 1000);
  }
  onCancel(): void {
    this.cancel.emit();
  }
}
