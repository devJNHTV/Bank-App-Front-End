import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Account } from '../../../interfaces/account.interface';
import { AccountService } from '../../../services/account/account.service';
import { Customer } from '../../../interfaces/customer.inteface';
import { CustomerService } from '../../../services/customer/customer.service';
import { Router } from '@angular/router';
import { KycService } from '../../../core/services/kyc.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    FormsModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  providers: [MessageService]
})
export class PaymentComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  loading: boolean = false;
  addAccount: boolean = false;
  
  // Customer info và flow states
  currentStep: number = 1; // 1: Xác nhận thông tin, 2: OTP
  customerInfo: Customer = {
    cifCode: '',
    fullName: '',
    address: '',
    email: '',
    dateOfBirth: new Date(),
    phoneNumber: '',
    status: '',
    identityNumber: ''
  }
  
  // OTP related
  otpCode: string = '';
  transactionId: string = '';
  isLoadingOtp: boolean = false;
  countdown: number = 120; // 2 phút
  canResend: boolean = false;
  private countdownInterval: any;
  private isKycVerifiedSubject = new BehaviorSubject<boolean>(false);
  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private customerService: CustomerService,
    private router: Router,
    private kycService: KycService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCustomerInfo();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách tài khoản:', error);
        this.loading = false;
      }
    });
  }
  loadCustomerInfo(): void {
      this.customerService.getCustomerInfo().subscribe({
      next: (res: any) => {
        this.customerInfo = res.data || [];   
        console.log(this.customerInfo);
      }
    });
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getAccountStatus(status: string): 'success' | 'warn' | 'danger' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'CLOSED') return 'warn';
    return 'danger';
  }

  trackByAccountNumber(index: number, account: Account): string {
    return account.accountNumber;
  }

  createAccount(): void {    
    this.addAccount = true;
    this.currentStep = 1;

  }

  // Xác nhận thông tin customer và chuyển sang bước OTP
  confirmCustomerInfo(): void {
    this.isLoadingOtp = true;
    
    // Giả lập call API để tạo request tài khoản
    // Trong thực tế sẽ call API tương tự như trong savings component
    setTimeout(() => {
      this.accountService.createPaymentAccount(this.customerInfo.cifCode).subscribe({
        next: (res: any) => {
          console.log('Step 2 API response:', res.data);
          this.transactionId = res.data.id;
          this.currentStep = 2;
          this.isLoadingOtp = false;
          this.startCountdown();
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Mã OTP đã được gửi đến email của bạn'
          });
        },
        error: (error) => {
          console.error('Lỗi khi tạo tài khoản:', error);
          this.isLoadingOtp = false;
        }
      }); 
    }, 2000);
  }

  // Xử lý OTP input
  onOtpInput(event: any): void {
    const value = event.target.value.replace(/\D/g, ''); // Chỉ cho phép số
    this.otpCode = value;
    
    if (value.length === 6) {
      this.verifyOtp();
    }
  }

  // Xác thực OTP
  verifyOtp(): void {
    if (this.otpCode.length !== 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng nhập đủ 6 số OTP'
      });
      return;
    }

    this.isLoadingOtp = true;

    // Giả lập call API xác thực OTP
    setTimeout(() => {
      // Giả lập OTP đúng nếu là 123456
      this.accountService.verifyOtpPaymentAccount(this.otpCode, this.transactionId).subscribe({
        next: (res: any) => {
          console.log('Step 2 API response:', res.data);
          this.currentStep = 3; // Chuyển sang step 3 thay vì reset
          this.isLoadingOtp = false;
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
          }
        },
        error: (error) => {
          console.error('Lỗi khi xác thực OTP:', error);
          this.isLoadingOtp = false;
          let errorMessage = '';
          if(error.error.status === 1023) {
            errorMessage = 'Mã OTP đã hết hạn. Vui lòng thử lại.';
          }
          if(error.error.status === 1024) {
            errorMessage = 'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng thử lại.';
            this.currentStep = 1;
          }
          if(error.error.status === 1025) {
            errorMessage = 'Mã OTP không đúng. Vui lòng thử lại.';
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: errorMessage
          });
        }
      });
    }, 1500);
  }

  // Gửi lại OTP
  resendOtp(): void {
    if (!this.canResend) return;
    
    this.isLoadingOtp = true;
    
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Mã OTP đã được gửi lại'
      });
      
      this.countdown = 120;
      this.canResend = false;
      this.isLoadingOtp = false;
      this.startCountdown();
    }, 1000);
  }

  // Bắt đầu đếm ngược
  private startCountdown(): void {
    this.canResend = false;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  // Format thời gian đếm ngược
  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Quay lại bước trước
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    } else {
      this.resetForm();
    }
  }

  // Xác nhận hoàn tất và quay về danh sách tài khoản
  onConfirm(): void {
    this.resetForm();
    this.loadAccounts();
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tài khoản thanh toán đã được tạo thành công!'
    });
  }

  // Reset form
  private resetForm(): void {
    this.addAccount = false;
    this.currentStep = 1;
    this.otpCode = '';
    this.transactionId = '';
    this.countdown = 120;
    this.canResend = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  goToDetail(accountNumber: string): void {
    this.router.navigate(['/account/payment/detail', accountNumber]);
  }
  formathideEMail(email : string ): string
  {

    const [username, domain] = email.split('@');

      if (username.length <= 3) {
        return '*'.repeat(username.length) + '@' + domain;
      }

      const visiblePart = username.slice(0, 3);
      const hiddenPart = '*'.repeat(username.length - 3);

      return `${visiblePart}${hiddenPart}@${domain}`;
  }
}
