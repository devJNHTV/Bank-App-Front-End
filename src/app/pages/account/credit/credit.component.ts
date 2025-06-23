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
import { CreditAccount } from '../../../interfaces/account.interface';
import { Customer } from '../../../interfaces/customer.inteface';
import { CustomerService } from '../../../services/customer/customer.service';
import { Router } from '@angular/router';
import { KycService } from '../../../core/services/kyc.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-credit',
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
  templateUrl: './credit.component.html',
  styleUrl: './credit.component.scss',
  providers: [MessageService]
})
export class CreditComponent implements OnInit, OnDestroy {
  creditAccounts: CreditAccount[] = [];
  loading: boolean = false;
  addCreditCard: boolean = false;
  
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
    this.accountService.getCreditAccounts().subscribe({
      next: (res: any) => {
        this.creditAccounts = res.data || [];
        this.creditAccounts.forEach(account => {
          account.availableCredit = account.creditLimit - account.currentDebt;
        }); 
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

  getCreditStatus(balance: number): 'success' | 'warn' | 'danger' {
    if (balance >= 50000000) return 'success';
    if (balance >= 10000000) return 'warn';
    return 'danger';
  }

  trackByAccountNumber(index: number, account: CreditAccount): string {
    return account.accountNumber;
  }

  createCreditCard(): void {    
    this.router.navigate(['/account/credit/register']);
  }

  // Xác nhận thông tin customer và chuyển sang bước OTP
  confirmCustomerInfo(): void {
    this.isLoadingOtp = true;
    
    // Call API để tạo request thẻ tín dụng
    const formData = {
      cifCode: this.customerInfo.cifCode
    };
    
    this.accountService.applyCredit(formData).subscribe({
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
      error: (error: any) => {
        console.error('Lỗi khi tạo thẻ tín dụng:', error);
        this.isLoadingOtp = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Có lỗi xảy ra khi tạo yêu cầu thẻ tín dụng'
        });
      }
    });
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

    // Call API xác thực OTP cho thẻ tín dụng
    this.accountService.verifyOtpCredit(this.otpCode, this.transactionId).subscribe({
      next: (res: any) => {
        console.log('OTP verification API response:', res.data);
        this.currentStep = 3; // Chuyển sang step 3 thành công
        this.isLoadingOtp = false;
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
      },
      error: (error: any) => {
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
  }

  // Gửi lại OTP
  resendOtp(): void {
    this.isLoadingOtp = true;
    this.canResend = false;
    this.countdown = 120;
    
    this.accountService.resendOtpCredit(this.transactionId).subscribe({
      next: (res: any) => {
        this.isLoadingOtp = false;
        this.startCountdown();
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Mã OTP mới đã được gửi'
        });
      },
      error: (error: any) => {
        console.error('Lỗi khi gửi lại OTP:', error);
        this.isLoadingOtp = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Có lỗi xảy ra khi gửi lại OTP'
        });
      }
    });
  }

  private startCountdown(): void {
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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    if (this.currentStep === 1) {
      this.addCreditCard = false;
      this.currentStep = 1;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    } else if (this.currentStep === 2) {
      this.currentStep = 1;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    }
    this.resetForm();
  }

  onConfirm(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Hoàn tất',
      detail: 'Yêu cầu mở thẻ tín dụng đã được gửi thành công!'
    });
    
    // Reset về trạng thái ban đầu
    this.resetForm();
    this.addCreditCard = false;
    this.loadAccounts(); // Reload danh sách để có thể hiển thị thẻ mới nếu có
  }

  private resetForm(): void {
    this.otpCode = '';
    this.transactionId = '';
    this.isLoadingOtp = false;
    this.countdown = 120;
    this.canResend = false;
    this.currentStep = 1;
  }

  goToCreditDetail(cardNumber: string): void {
    if (!cardNumber) {
      console.error('Số thẻ không hợp lệ');
      return;
    }
    this.router.navigate(['/account/credit/detail', cardNumber]);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
