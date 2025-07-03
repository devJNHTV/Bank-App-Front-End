import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { StepperComponent } from '../../components/stepper/stepper.component';
import { Account, AccountSavings, Term } from '../../interfaces/account.interface';
import { AccountService } from '../../services/account/account.service';
import { Step1FormComponent } from './steps/step1-form.component';
import { Step2ConfirmationComponent } from './steps/step2-confirmation.component';
import { Step3OtpComponent } from './steps/step3-otp.component';
import { WithdrawStep1Component } from './steps/withdraw-step1.component';
import { WithdrawStep2Component } from './steps/withdraw-step2.component';
import { WithdrawStep3Component } from './steps/withdraw-step3.component';
import { MessageService } from 'primeng/api';
import { Customer } from '../../interfaces/customer.inteface';
import { DialogModule } from 'primeng/dialog';
import { KycService } from '../../services/kyc/kyc.service';

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
    Step3OtpComponent,
    WithdrawStep1Component,
    WithdrawStep2Component,
    WithdrawStep3Component,
    DialogModule
  ],
  templateUrl:  './savings.component.html',
  styleUrl: './savings.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],


})
export class SavingsComponent {
  @ViewChild(Step3OtpComponent) step3Component!: Step3OtpComponent;
  @ViewChild(WithdrawStep3Component) withdrawStep3Component!: WithdrawStep3Component;
  
  // Navigation
  currentView: string = 'main';
  showKycDialog: boolean = false;
  showPendingDialog: boolean = false;
  pendingAction: string = ''; // Store which action needs KYC verification
  
  // Create account flow
  currentStep: number = 1;
  formData: any = null;
  transactionId: string = '';
  
  // Withdraw flow
  withdrawStep: number = 1;
  withdrawFormData: any = null;
  withdrawTransactionId: string = '';
  
  // Data
  accounts: Account[] = [];
  savingsAccounts: AccountSavings[] = [];
  terms: Term[] = [];
  loading: boolean = false;
  customer: Customer = {
    cifCode: '',
    fullName: '',
    address: '',
    email: '',
    dateOfBirth: new Date(),
    phoneNumber: '',
    status: '',
    identityNumber: ''
  } 
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private kycService: KycService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.accountService.getAccounts().subscribe((res: any) => {
      this.accounts = res.data;
      // Giả lập tài khoản tiết kiệm (trong thực tế sẽ có API riêng)
      this.accountService.getSavingsAccounts().subscribe((res: any) => {
        this.savingsAccounts = res.data;
        console.log(this.savingsAccounts);
      });
      console.log(this.accounts);
    });
    
    this.accountService.getTerms().subscribe((res: any) => {
      this.terms = res.data;
      console.log(this.terms);
    });
  }

  // Navigation methods
  setCurrentView(view: string): void {
    // Check KYC for specific actions
    if (view === 'open-account' || view === 'withdraw') {
      this.checkKycForAction(view);
      return;
    }
    
    this.currentView = view;
    if (view === 'main') {
      this.resetSteps();
    }
  }

  // Check KYC status before allowing certain actions
  checkKycForAction(action: string): void {
    this.pendingAction = action;
    
    this.kycService.getKycStatus().subscribe({
      next: (res: any) => {
        console.log('Trạng thái KYC:', res.status);
        if(res.status === 'VERIFIED') {
          // KYC verified, proceed with action
          this.currentView = action;
          if (action === 'main') {
            this.resetSteps();
          }
        }
        else if(res.status === 'PENDING') {
          // Show pending dialog
          this.showPendingDialog = true;
        }
        else {
          // Show KYC verification dialog
          this.showKycDialog = true;
        }
      },
      error: (error) => {
        console.error('Lỗi khi kiểm tra KYC:', error);
        // On error, show KYC dialog
        this.showKycDialog = true;
      }
    });
  }

  getViewTitle(view: string): string {
    const titles: {[key: string]: string} = {
      'deposit': 'Nộp thêm vào tiết kiệm',
      'close-account': 'Tất toán tiết kiệm',
      'auto-savings': 'Tiết kiệm tự động',
      'cancel-auto': 'Hủy tiết kiệm tự động'
    };
    return titles[view] || '';
  }

  resetSteps(): void {
    this.currentStep = 1;
    this.formData = null;
    this.transactionId = '';
    this.withdrawStep = 1;
    this.withdrawFormData = null;
    this.withdrawTransactionId = '';
  }

  resetAndGoHome(): void {
    this.resetSteps();
    this.setCurrentView('main');
    this.loadData(); // Reload data to show updated accounts
  }

  resetWithdrawAndGoHome(): void {
    this.resetSteps();
    this.setCurrentView('main');
    this.loadData(); // Reload data to show updated accounts
  }

  // Withdraw from account card button
  withdrawFromAccount(account: AccountSavings): void {
    // Check KYC before allowing withdraw
    this.pendingAction = 'withdraw';
    
    this.kycService.getKycStatus().subscribe({
      next: (res: any) => {
        console.log('Trạng thái KYC:', res.status);
        if(res.status === 'VERIFIED') {
          // KYC verified, proceed with withdraw
          this.setCurrentView('withdraw');
          this.withdrawFormData = {
            selectedSavingsAccount: account.accountNumber
          };
        }
        else if(res.status === 'PENDING') {
          // Show pending dialog
          this.showPendingDialog = true;
        }
        else {
          // Show KYC verification dialog
          this.showKycDialog = true;
        }
      },
      error: (error) => {
        console.error('Lỗi khi kiểm tra KYC:', error);
        // On error, show KYC dialog
        this.showKycDialog = true;
      }
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
        this.currentStep = 4;
        // if (res.data && res.data.success) {
        //   // Chuyển sang step 4 (Success)
        //   this.currentStep = 4;
        // } else {
        //   // Hiển thị lỗi OTP không đúng
        //   let errorMessage = res.message || 'Mã OTP không đúng. Vui lòng thử lại.';
        //   this.step3Component.showError(errorMessage);
        // }
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

  // Withdraw flow methods
  onWithdrawStep1Submit(formData: any): void {
    console.log('Withdraw Step 1 form submitted:', formData);
    this.withdrawFormData = formData;
    this.withdrawStep = 2;
  }

  onWithdrawStep2Confirm(formData: any): void {
    console.log('Withdraw Step 2 confirmed, final data:', formData);
    this.withdrawFormData = formData;
    // TODO: Call API to create withdraw transaction
    this.accountService.createWithdrawTransaction(this.withdrawFormData).subscribe({
      next: (res: any) => {
        console.log('Withdraw Step 2 API response:', res.data);
        this.withdrawTransactionId = res.data.id;
        this.withdrawStep = 3;
      },
      error: (error) => {
        console.error('Lỗi khi tạo giao dịch rút tiền:', error);
      }
    });
  }

  onWithdrawStep2Back(): void {
    this.withdrawStep = 1;
  }

  onWithdrawOtpSubmit(data: {transactionId: string, otpCode: string}): void {
    console.log('Withdraw OTP submitted:', data);
    // TODO: Call API to verify withdraw OTP
    this.accountService.verifyWithdrawOtp(data.otpCode, data.transactionId).subscribe({
      next: (res: any) => {
        console.log('Withdraw OTP verification response:', res);
        this.withdrawStep = 4;
      },
      error: (error) => {
        this.withdrawStep3Component.isLoading = false;
        console.error('Lỗi khi xác thực OTP rút tiền:', error);
        let errorMessage = 'Có lỗi khi xác thực OTP rút tiền. Vui lòng thử lại.';
          if(error.error.status === 1023) {
            errorMessage = 'Mã OTP đã hết hạn. Vui lòng thử lại.';
          }
          if(error.error.status === 1024) {
            errorMessage = 'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng thử lại.';
            this.withdrawStep = 1;
          }
          if(error.error.status === 1025) {
            errorMessage = 'Mã OTP không đúng. Vui lòng thử lại.';
          }
         this.withdrawStep3Component.showError(errorMessage);

      }
    });

  }

  onWithdrawStep3Back(): void {
    this.withdrawStep = 2;
  }

  onWithdrawResendOtp(transactionId: string): void {
    console.log('Resending withdraw OTP for:', transactionId);
    
      // TODO: Call API to resend withdraw OTP
      this.accountService.resendOtp(transactionId).subscribe({
        next: (res: any) => {
          console.log('Resend withdraw OTP response:', res);
        },
        error: (error) => {
          console.error('Lỗi khi gửi lại OTP rút tiền:', error);
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


  trackByAccountNumber(index: number, account: Account): string {
    return account.accountNumber;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('vi-VN');
  }

  // Dialog handling methods
  onKycDialogConfirm(): void {
    this.showKycDialog = false;
    this.router.navigate(['/kyc']);
  }

  onKycDialogCancel(): void {
    this.showKycDialog = false;
    this.pendingAction = '';
  }

  onPendingDialogConfirm(): void {
    this.showPendingDialog = false;
    this.pendingAction = '';
  }
}

