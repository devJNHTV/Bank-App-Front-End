import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CreditAccount, CreditCardDetails, Transaction } from '../../../../interfaces/account.interface';
import { AccountService } from '../../../../services/account/account.service';
import { Customer } from '../../../../interfaces/customer.inteface';
import { CustomerService } from '../../../../services/customer/customer.service';

@Component({
  selector: 'app-credit-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule, 
    DropdownModule, 
    TableModule, 
    TagModule, 
    TooltipModule, 
    PaginatorModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './credit-detail.component.html',
  styleUrl: './credit-detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})
export class CreditDetailComponent implements OnInit, OnDestroy {
  creditCard: CreditAccount = {
    accountNumber: '',
    balance: 0,
    status: '',
    openedDate: new Date(),
    accountType: '',
    creditLimit: 0,
    currentDebt: 0,
    availableCredit: 0,
    cifCode: '',
    typeName: '',
    imageUrl: ''
  };
  creditCardDetails: CreditCardDetails = {
    cardNumber: '',
    cardHolderName: '',
    cardExpiryDate: '',
  };
  customer: Customer = {
    cifCode: '',
    fullName: '',
    address: '',
    email: '',
    dateOfBirth: new Date(),
    phoneNumber: '',
    status: '',
    identityNumber: ''
  };
  

  transactions: Transaction[] = [];
  accountNumber: string = '';

  // Pagination properties
  first: number = 0;
  rows: number = 8;
  totalRecords: number = 0;
  currentPage: number = 0;

  // Dialog states
  showCardDetailsDialog: boolean = false;
  showOtpDialog: boolean = false;
  showCVV: boolean = false;
  
  // OTP verification states
  otpCode: string = '';
  isLoadingOtp: boolean = false;
  otpCountdown: number = 120;
  canResendOtp: boolean = false;
  private otpCountdownInterval: any;
  transactionId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private customerService: CustomerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.accountNumber = this.route.snapshot.paramMap.get('cardAccountNumber') || '';
    this.loadCreditCardInfo();
    this.loadCustomerInfo();
    this.loadTransactions();
  }

  loadCreditCardInfo() {
    // Giả lập load thông tin thẻ tín dụng từ API
    // Trong thực tế sẽ có API riêng cho credit card detail
    this.accountService.getCreditAccounts().subscribe((res: any) => {
      const creditCards = res.data || [];
      this.creditCard = creditCards.find((card: CreditAccount) => 
        card.accountNumber === this.accountNumber) || this.creditCard;
      
      if (this.creditCard.accountNumber) {
        this.creditCard.availableCredit = this.creditCard.creditLimit - this.creditCard.currentDebt;
      }
      
      console.log('Credit card info:', this.creditCard);
    });
  }

  loadCustomerInfo() {
    this.customerService.getCustomerInfo().subscribe((res: any) => {
      this.customer = res.data;
      console.log('Customer info:', this.customer);
    });
  }

  loadTransactions() {
    // Giả lập load giao dịch thẻ tín dụng
    // Trong thực tế sẽ có API riêng cho credit card transactions
    this.accountService.getTransactions(this.accountNumber, this.currentPage, this.rows).subscribe({
      next: (res: any) => {
        console.log('Transaction response:', res.result);
        this.transactions = res.result?.content || [];
        this.totalRecords = res.result?.totalElements || 0;
        console.log('Transactions:', this.transactions);
        console.log('Total records:', this.totalRecords);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        // Fallback với mock data nếu API chưa có
        this.loadMockTransactions();
      }
    });
  }

  loadMockTransactions() {
    // Mock data cho giao dịch thẻ tín dụng
    this.transactions = [
    ];
    this.totalRecords = this.transactions.length;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.currentPage = event.page;
    this.loadTransactions();
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  }

  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 12) return cardNumber;
    return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
  }

  getExpiryDate(openedDate: Date): Date {
    const expiry = new Date(openedDate);
    expiry.setFullYear(expiry.getFullYear() + 5); // Thẻ có hạn 5 năm
    return expiry;
  }

  getCardStatus(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'active';
      case 'BLOCKED': return 'blocked';
      case 'EXPIRED': return 'expired';
      default: return 'inactive';
    }
  }

  getCardStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'BLOCKED': return 'Tạm khóa';
      case 'EXPIRED': return 'Hết hạn';
      default: return 'Không hoạt động';
    }
  }

  getTransactionType(type: string): string {
    return type === 'CREDIT' ? 'positive' : 'negative';
  }

  // Action methods
  copyCardNumber() {
    navigator.clipboard.writeText(this.creditCard.accountNumber);
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã sao chép số thẻ'
    });
  }

  viewCardDetails() {
    // Yêu cầu OTP trước khi hiển thị thông tin thẻ
    this.requestOtpForCardDetails();
  }

  requestOtpForCardDetails() {
    this.isLoadingOtp = true;
    
    // Gọi API để gửi OTP
    // Trong thực tế sẽ có API riêng cho việc xem thông tin thẻ
     this.accountService.sendOtpForCardDetails(this.accountNumber).subscribe((res: any) => {
      console.log('OTP response:', res.data);
      this.transactionId = res.data;

     });
    setTimeout(() => {
      this.showOtpDialog = true;
      this.isLoadingOtp = false;
      this.startOtpCountdown();
      this.messageService.add({
        severity: 'success',
        summary: 'OTP đã được gửi',
        detail: 'Mã OTP đã được gửi đến số điện thoại đăng ký của bạn'
      });
    }, 1500);
  }

  verifyOtpForCardDetails() {
    this.isLoadingOtp = true;
    this.accountService.verifyOtpForCardDetails(this.otpCode, this.transactionId, this.accountNumber).subscribe({
      next: (res: any) => {
        console.log('OTP response:', res.data);
        this.creditCardDetails = res.data;
        this.showOtpDialog = false;
        this.showCardDetailsDialog = true;
        this.isLoadingOtp = false;
        this.resetOtpForm();
        this.messageService.add({
          severity: 'success',
          summary: 'Xác thực thành công',
          detail: 'Bạn có thể xem thông tin thẻ'
        });
      },
      error: (error: any) => {
        console.error('Error verifying OTP:', error);
        console.error('Lỗi khi xác thực OTP:', error);
        this.isLoadingOtp = false;
        let errorMessage = '';
          if(error.error.status === 1023) {
            errorMessage = 'Mã OTP đã hết hạn. Vui lòng thử lại.';
          }
          if(error.error.status === 1024) {
            errorMessage = 'Bạn đã nhập sai OTP quá nhiều lần. Vui lòng thử lại.';
            this.showCardDetailsDialog=false;
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

  resendOtpForCardDetails() {
    this.isLoadingOtp = true;
    this.canResendOtp = false;
    this.otpCountdown = 120;
    
    setTimeout(() => {
      this.isLoadingOtp = false;
      this.startOtpCountdown();
      this.messageService.add({
        severity: 'success',
        summary: 'OTP mới đã được gửi',
        detail: 'Mã OTP mới đã được gửi đến số điện thoại của bạn'
      });
    }, 1000);
  }

  startOtpCountdown() {
    this.canResendOtp = false;
    this.otpCountdown = 120;
    
    this.otpCountdownInterval = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) {
        this.canResendOtp = true;
        clearInterval(this.otpCountdownInterval);
      }
    }, 1000);
  }

  formatOtpCountdown(): string {
    const minutes = Math.floor(this.otpCountdown / 60);
    const seconds = this.otpCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onOtpInput(event: any): void {
    const value = event.target.value.replace(/\D/g, ''); // Chỉ cho phép số
    this.otpCode = value;
    
    // Tự động xác thực khi nhập đủ 6 số
    if (value.length === 6) {
      setTimeout(() => {
        this.verifyOtpForCardDetails();
      }, 500);
    }
  }

  resetOtpForm() {
    this.otpCode = '';
    this.isLoadingOtp = false;
    this.otpCountdown = 120;
    this.canResendOtp = false;
    if (this.otpCountdownInterval) {
      clearInterval(this.otpCountdownInterval);
    }
  }

  closeOtpDialog() {
    this.showOtpDialog = false;
    this.resetOtpForm();
  }

  toggleCVVVisibility() {
    this.showCVV = !this.showCVV;
  }

  toggleCardStatus() {
    const action = this.creditCard.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
    const newStatus = this.creditCard.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn ${action} thẻ tín dụng này?`,
      header: `Xác nhận ${action} thẻ`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Gọi API để thay đổi trạng thái thẻ
        this.creditCard.status = newStatus;
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã ${action} thẻ tín dụng thành công`
        });
      }
    });
  }

  changePIN() {
    this.messageService.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Tính năng đổi PIN sẽ được triển khai sớm'
    });
  }

  setTransactionLimit() {
    this.messageService.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Tính năng thiết lập hạn mức sẽ được triển khai sớm'
    });
  }

  reportLostCard() {
    this.confirmationService.confirm({
      message: 'Báo mất thẻ sẽ khóa thẻ ngay lập tức. Bạn có chắc chắn?',
      header: 'Xác nhận báo mất thẻ',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.creditCard.status = 'BLOCKED';
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã báo mất thẻ và khóa thẻ thành công. Chúng tôi sẽ liên hệ với bạn để làm thẻ mới.'
        });
      }
    });
  }

  downloadStatement() {
    this.messageService.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Đang chuẩn bị sao kê, vui lòng đợi trong giây lát'
    });
  }

  exportTransactions() {
    this.messageService.add({
      severity: 'info',
      summary: 'Thông báo',
      detail: 'Đang xuất file giao dịch...'
    });
  }

  ngOnDestroy(): void {
    if (this.otpCountdownInterval) {
      clearInterval(this.otpCountdownInterval);
    }
  }
} 