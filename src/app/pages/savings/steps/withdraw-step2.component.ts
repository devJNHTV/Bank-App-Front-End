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
    <p-card>
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
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-section {
      margin-bottom: 2.5rem;
      position: relative;
    }

    .info-section:last-child {
      margin-bottom: 1.5rem;
    }

    .section-title {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.2rem;
      padding-bottom: 0.8rem;
      border-bottom: 3px solid #007bff;
      display: block;
      position: relative;
    }

    .section-title::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 50px;
      height: 3px;
      background: #28a745;
      border-radius: 2px;
    }

    .info-card {
      background: linear-gradient(145deg, #f8f9fa, #e9ecef);
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 2rem;
      margin-top: 1.2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem;
      padding: 0.8rem 0;
      border-bottom: 1px solid #e9ecef;
      transition: background-color 0.2s ease;
    }

    .info-row:hover {
      background-color: rgba(0, 123, 255, 0.02);
      border-radius: 6px;
      margin: 0 -0.5rem 1.2rem -0.5rem;
      padding: 0.8rem 0.5rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 500;
      color: #495057;
      flex: 1.2;
      text-align: left;
      font-size: 0.95rem;
    }

    .info-row .value {
      font-weight: 600;
      color: #212529;
      text-align: right;
      flex: 1;
      font-size: 1rem;
    }

    .info-row .value.balance {
      color: #28a745;
      font-size: 1.15rem;
      font-weight: 700;
    }

    .info-row .value.reduced-rate {
      color: #dc3545;
      
      small {
        font-size: 0.8rem;
        margin-left: 0.5rem;
        font-weight: normal;
        color: #6c757d;
      }
    }

    .info-row.total {
      margin-top: 1.5rem;
      border-top: 3px solid #007bff;
      border-bottom: none;
      padding-top: 1.5rem;
      padding-bottom: 0;
      background: rgba(0, 123, 255, 0.05);
      border-radius: 8px;
      margin-left: -1rem;
      margin-right: -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
      
      .label, .value {
        font-size: 1.3rem;
        font-weight: 700;
      }
      
      .value {
        color: #007bff;
      }
    }

    .warning-section {
      margin: 2rem 0;
    }

    .warning-card {
      background: linear-gradient(145deg, #fff3cd, #ffeaa7);
      border: 1px solid #ffeaa7;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1.2rem;
      box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
    }

    .warning-card i {
      color: #856404;
      font-size: 1.8rem;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .warning-content {
      flex: 1;
    }

    .warning-content h4 {
      color: #856404;
      margin: 0 0 0.8rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .warning-content p {
      color: #856404;
      margin: 0;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #dee2e6;
    }

    .form-actions button {
      flex: 1;
      max-width: 220px;
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .form-actions button:first-child {
      margin-right: auto;
    }

    .form-actions button:last-child {
      margin-left: auto;
    }

    .form-actions button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .confirmation-content {
        padding: 1.5rem;
        margin: 1rem;
        max-width: calc(100% - 2rem);
      }
      
      .info-card {
        padding: 1.5rem;
      }
      
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1rem 0;
      }
      
      .info-row .label,
      .info-row .value {
        text-align: left;
        flex: none;
        width: 100%;
      }
      
      .info-row .label {
        font-size: 0.9rem;
        color: #6c757d;
      }
      
      .info-row .value {
        font-size: 1.05rem;
        font-weight: 600;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 1rem;
        padding-top: 1.5rem;
      }
      
      .form-actions button {
        max-width: none;
        margin: 0;
        height: 44px;
      }
      
      .section-title {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .confirmation-content {
        padding: 1rem;
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
      }
      
      .info-card {
        padding: 1rem;
      }
      
      .section-title {
        font-size: 1.1rem;
      }
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