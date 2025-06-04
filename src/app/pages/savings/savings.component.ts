import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
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
  terms: Term[] = [];
  formData: any = null;
  transactionId: string = '';
  
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe((res: any) => {
      this.accounts = res.data;
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
    
    this.accountService.createAccount(this.formData).subscribe({
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
      }
    });
  }

  // Handle back button from Step 2
  onStep2Back(): void {
    this.currentStep = 1;
  }

  // Handle OTP submission from Step 3
  onOtpSubmit(data: {savingRequestID: string, otpCode: string}): void {
    console.log('OTP submitted:', data);
    
    // Gửi ID và OTP xuống backend để xác thực
    this.accountService.verifyOtp(data.otpCode, data.savingRequestID).subscribe({
      next: (res: any) => {
        console.log('OTP verification successful:', res);
        // Reset loading state và hiển thị thành công
        if (this.step3Component) {
          this.step3Component.resetLoading();
          this.step3Component.showSuccess('Xác thực OTP thành công!');
        }
        
        // Chuyển sang step thành công sau 1 giây
        setTimeout(() => {
          this.currentStep = 4;
        }, 1500);
      },
      error: (error: any) => {
        console.error('OTP verification failed:', error);
        console.error('status code appexception:', error.error.status);
        
        // Reset loading state
        if (this.step3Component) {
          this.step3Component.resetLoading();
          
          // Xử lý các loại lỗi khác nhau
          let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
          
          if (error.status === 400) {
            errorMessage = 'Mã OTP không chính xác. Vui lòng kiểm tra lại.';
          } else if (error.status === 410 || error.error?.message?.includes('expired')) {
            errorMessage = 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại OTP.';
          } else if (error.status === 429) {
            errorMessage = 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.step3Component.showError(errorMessage);
        }
      }
    });
  }

  // Handle back button from Step 3
  onStep3Back(): void {
    this.currentStep = 2;
  }

  // Handle resend OTP from Step 3
  onResendOtp(transactionId: string): void {
    console.log('Resending OTP for transaction:', transactionId);
    
    this.accountService.resendOtp(transactionId).subscribe({
      next: (res: any) => {
        console.log('OTP resent successfully:', res);
        if (this.step3Component) {
          this.step3Component.showSuccess('Mã OTP đã được gửi lại thành công!');
        }
      },
      error: (error: any) => {
        console.error('Failed to resend OTP:', error);
        if (this.step3Component) {
          let errorMessage = 'Không thể gửi lại OTP. Vui lòng thử lại.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.step3Component.showError(errorMessage);
        }
      }
    });
  }
}

