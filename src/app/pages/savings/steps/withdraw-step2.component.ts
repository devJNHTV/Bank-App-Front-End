import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Account, AccountSavings } from '../../../interfaces/account.interface';

@Component({
  selector: 'app-withdraw-step2',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule
  ],
  template: `
    <p-card header="Xác nhận thông tin rút tiền">
      <div class="confirmation-content">
        
        <!-- Thông tin tài khoản tiết kiệm -->
        <div class="info-section">
          <h3 class="section-title">Tài khoản tiết kiệm</h3>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Số tài khoản:</span>
              <span class="value">{{ withdrawData?.savingsAccountNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Số dư hiện tại:</span>
              <span class="value balance">{{ formatCurrency(getSavingsAccount()?.balance || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Kỳ hạn:</span>
              <span class="value">{{ getSavingsAccount()?.termValueMonths }} tháng</span>
            </div>
            <div class="info-row">
              <span class="label">Lãi suất gốc:</span>
              <span class="value">{{ (getSavingsAccount()?.interestRate || 0) * 100 }}%/năm</span>
            </div>
            <div class="info-row">
              <span class="label">Ngày mở:</span>
              <span class="value">{{ getSavingsAccount()?.openedDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>

        <!-- Thông tin giao dịch -->
        <div class="info-section">
          <h3 class="section-title">Thông tin giao dịch</h3>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Tài khoản đích:</span>
              <span class="value">{{ withdrawData?.destinationAccountNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Loại tài khoản đích:</span>
              <span class="value">{{ getDestinationAccount()?.accountType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Loại rút tiền:</span>
              <span class="value">{{ getWithdrawTypeLabel() }}</span>
            </div>
          </div>
        </div>

        <!-- Chi tiết số tiền -->
        <div class="info-section">
          <h3 class="section-title">Chi tiết số tiền</h3>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Số tiền gốc:</span>
              <span class="value">{{ formatCurrency(withdrawData?.amount || 0) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Số ngày gửi:</span>
              <span class="value">{{ getDaysFromOpening() }} ngày</span>
            </div>
            <div class="info-row">
              <span class="label">Lãi suất áp dụng:</span>
              <span class="value" [class.reduced-rate]="isEarlyWithdrawal()">
                {{ getAppliedInterestRate() * 100 }}%/năm
                <small *ngIf="isEarlyWithdrawal()">(Rút trước hạn)</small>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Tiền lãi:</span>
              <span class="value">{{ formatCurrency(calculateInterest()) }}</span>
            </div>
            <div class="info-row total">
              <span class="label">Tổng tiền thực lãnh:</span>
              <span class="value">{{ formatCurrency(getTotalAmount()) }}</span>
            </div>
            <div class="info-row" *ngIf="withdrawData?.withdrawType === 'partial'">
              <span class="label">Số dư còn lại:</span>
              <span class="value">{{ formatCurrency(getRemainingBalance()) }}</span>
            </div>
          </div>
        </div>

        <!-- Cảnh báo -->

        <!-- Cảnh báo đóng tài khoản -->
    

        <!-- Thông tin thời gian -->
        <div class="info-section">
          <h3 class="section-title">Xác thực</h3>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Phương thức xác thực:</span>
              <span class="value">Xác minh OTP qua Email</span>
            </div>
            <div class="info-row">
              <span class="label">Phí giao dịch:</span>
              <span class="value">Miễn phí</span>
            </div>
            <div class="info-row">
              <span class="label">Thời gian xử lý:</span>
              <span class="value">Ngay lập tức</span>
            </div>
          </div>
        </div>

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
          type="button" 
          pButton 
          label="Xác nhận rút tiền" 
          icon="pi pi-check"
          iconPos="right"
          class="p-button"
          (click)="onConfirm()">
        </button>
      </div>
    </p-card>
  `,
  styles: [`
    .confirmation-content {
      padding: 1rem 0;
    }

    .info-section {
      margin-bottom: 2rem;
    }

    .section-title {
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #007bff;
    }

    .info-card {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .info-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
      flex: 1;
    }

    .info-row .value {
      font-weight: 600;
      color: #333;
      text-align: right;
      flex: 1;
    }

    .info-row .value.balance {
      color: #28a745;
      font-size: 1.1rem;
    }

    .info-row .value.reduced-rate {
      color: #dc3545;
      small {
        font-size: 0.8rem;
        margin-left: 0.5rem;
      }
    }

    .info-row.total {
      margin-top: 1rem;
      border-top: 2px solid #007bff;
      padding-top: 1rem;
      
      .label, .value {
        font-size: 1.2rem;
        font-weight: 700;
      }
      
      .value {
        color: #007bff;
      }
    }

    .warning-section {
      margin: 1rem 0;
    }

    .warning-card {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .warning-card i {
      color: #856404;
      font-size: 1.5rem;
      margin-top: 0.25rem;
    }

    .warning-content h4 {
      color: #856404;
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }

    .warning-content p {
      color: #856404;
      margin: 0;
      line-height: 1.5;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `]
})
export class WithdrawStep2Component {
  @Input() withdrawData: any;
  @Input() savingsAccounts: AccountSavings[] = [];
  @Input() paymentAccounts: Account[] = [];
  @Output() confirmSubmit = new EventEmitter<any>();
  @Output() backToPrevious = new EventEmitter<void>();

  private EARLY_WITHDRAWAL_RATE = 0.005; // 0.5% per year

  getSavingsAccount(): AccountSavings | undefined {
    return this.savingsAccounts.find(
      account => account.accountNumber === this.withdrawData?.savingsAccountNumber
    );
  }

  getDestinationAccount(): Account | undefined {
    return this.paymentAccounts.find(
      account => account.accountNumber === this.withdrawData?.destinationAccountNumber
    );
  }

  getWithdrawTypeLabel(): string {
    return this.withdrawData?.withdrawType === 'full' ? 'Rút toàn bộ' : 'Rút một phần';
  }

  getRemainingBalance(): number {
    const account = this.getSavingsAccount();
    if (!account || !this.withdrawData?.amount) return 0;
    return account.balance - this.withdrawData.amount;
  }

  getDaysFromOpening(): number {
    const account = this.getSavingsAccount();
    if (!account) return 0;
    
    const openDate = new Date(account.openedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - openDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isEarlyWithdrawal(): boolean {
    const account = this.getSavingsAccount();
    if (!account) return false;
    
    const daysFromOpening = this.getDaysFromOpening();
    //test rut đúng hạn
    //const termDays = account.termValueMonths /12; // Approximate month to days
     const termDays = account.termValueMonths * 30; // Approximate month to days
    return daysFromOpening < termDays;
  }

  getAppliedInterestRate(): number {
    const account = this.getSavingsAccount();
    if (!account) return 0;
    
    return this.isEarlyWithdrawal() ? this.EARLY_WITHDRAWAL_RATE : account.interestRate;
  }

  calculateInterest(): number {
    const account = this.getSavingsAccount();
    if (!account || !this.withdrawData?.amount) return 0;
    
    const daysFromOpening = this.getDaysFromOpening();
    const appliedRate = this.getAppliedInterestRate();
    
    // Interest = Principal * Rate * Time
    // where Time is in years (days/365)
    return this.withdrawData.amount * appliedRate * (daysFromOpening / 365);
  }

  getTotalAmount(): number {
    if (!this.withdrawData?.amount) return 0;
    return this.withdrawData.amount + this.calculateInterest();
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  onBack(): void {
    this.backToPrevious.emit();
  }

  onConfirm(): void {
    const formData = {
      savingsAccountNumber: this.withdrawData?.savingsAccountNumber,
      destinationAccountNumber: this.withdrawData?.destinationAccountNumber,
      withdrawType: this.withdrawData?.withdrawType,
      withdrawAmount:  Math.round(this.getTotalAmount()),
      amountOriginal: this.withdrawData?.amount,
    };
    this.confirmSubmit.emit(formData);
  }
} 