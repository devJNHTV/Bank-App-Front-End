import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { StepperComponent } from '../../components/stepper/stepper.component';
import { Account, Term } from '../../interfaces/account.interface';
import { AccountService } from '../../services/account/account.service';
import { Step1FormComponent } from './steps/step1-form.component';
import { Step2ConfirmationComponent } from './steps/step2-confirmation.component';
import { Step3OtpComponent } from './steps/step3-otp.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    TabViewModule,
    CardModule,
    TableModule,
    TagModule,
    StepperComponent,
    Step1FormComponent,
    Step2ConfirmationComponent,
    Step3OtpComponent
  ],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.scss'
})
export class SavingsComponent {
  @ViewChild(Step3OtpComponent) step3Component!: Step3OtpComponent;
  
  currentStep: number = 1;
  accounts: Account[] = [];
  savingsAccounts: Account[] = [];
  terms: Term[] = [];
  formData: any = null;
  transactionId: string = '';
  loading: boolean = false;
  
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.accountService.getAccounts().subscribe((res: any) => {
      this.accounts = res.data;
      // Giả lập tài khoản tiết kiệm (trong thực tế sẽ có API riêng)
      this.savingsAccounts = res.data?.map((acc: Account) => ({
        ...acc,
        accountNumber: acc.accountNumber.replace(/^(\d{3})/, '$1-TK'),
        balance: acc.balance * 0.8 // Giả lập số dư tiết kiệm
      })) || [];
      console.log(this.accounts);
    });
    
    this.accountService.getTerms().subscribe((res: any) => {
      this.terms = res.data;
      console.log(this.terms);
    });
  }

  // Handle form submission from Step 1
  onStep1Submit(formData: any): void {
    console.log('Step 1 form submitted:', formData);
    this.formData = formData;
    this.currentStep = 2;
  }

  // Handle confirmation from Step 2
  onStep2Confirm(): void {
    console.log('Step 2 confirmed, final data:', this.formData);
    
    this.accountService.createSavingsAccount(this.formData).subscribe({
      next: (res: any) => {
        console.log('Step 2 API response:', res.data);
        
        // Lưu transactionId từ response để chuyển sang step 3
        if (res.data && res.data.id) {
          this.transactionId = res.data.id;          
          // Chuyển sang step 3 (OTP verification)
          this.currentStep = 3;
        } else {
          console.error('Không tìm thấy transaction ID trong response');
        }
      },
      error: (error) => {
        console.error('Lỗi khi tạo tài khoản:', error);
        // Có thể hiển thị thông báo lỗi cho user
        let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
        this.step3Component.showError(errorMessage);
      }
    });
  }

  // Handle back to step 1 from step 2
  onStep2Back(): void {
    this.currentStep = 1;
  }

  // Handle OTP submission from Step 3
  onOtpSubmit(data: {savingRequestID: string, otpCode: string}): void {
    console.log('OTP submitted:', data);
    
    this.accountService.verifyOtp(data.otpCode, data.savingRequestID).subscribe({
      next: (res: any) => {
        console.log('OTP verification response:', res);
        
        if (res.data && res.data.success) {
          // Chuyển sang step 4 (Success)
          this.currentStep = 4;
        } else {
          // Hiển thị lỗi OTP không đúng
          let errorMessage = res.message || 'Mã OTP không đúng. Vui lòng thử lại.';
          this.step3Component.showError(errorMessage);
        }
      },
      error: (error) => {
        console.error('Lỗi khi xác thực OTP:', error);
        let errorMessage = 'Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.';
        this.step3Component.showError(errorMessage);
      }
    });
  }

  // Handle back to step 2 from step 3
  onStep3Back(): void {
    this.currentStep = 2;
  }

  // Handle resend OTP from step 3
  onResendOtp(savingRequestID: string): void {
    console.log('Resending OTP for:', savingRequestID);
    
    this.accountService.resendOtp(savingRequestID).subscribe({
      next: (res: any) => {
        console.log('Resend OTP response:', res);
        // Hiển thị thông báo thành công
        this.step3Component.showSuccess('Mã OTP đã được gửi lại.');
      },
      error: (error) => {
        console.error('Lỗi khi gửi lại OTP:', error);
        this.step3Component.showError('Có lỗi xảy ra khi gửi lại OTP.');
      }
    });
  }

  // Utility methods for savings account list
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getSavingsStatus(balance: number): 'success' | 'warn' | 'danger' {
    if (balance >= 50000000) return 'success';
    if (balance >= 10000000) return 'warn';
    return 'danger';
  }

  trackByAccountNumber(index: number, account: Account): string {
    return account.accountNumber;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('vi-VN');
  }
}

