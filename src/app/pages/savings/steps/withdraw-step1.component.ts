import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { Account, AccountSavings } from '../../../interfaces/account.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-withdraw-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputNumberModule,
    MessageModule,
    SelectModule
  ],
  template: `
    <p-card header="Thông tin rút tiền">
      <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()">
        
        <!-- Chọn tài khoản tiết kiệm -->
        <div class="form-field">
          <label class="form-label">Tài khoản tiết kiệm <span class="required">*</span></label>
          <p-select
            formControlName="savingsAccountNumber"
            [options]="savingsAccountOptions"
            placeholder="Chọn tài khoản tiết kiệm"
            optionLabel="label"
            optionValue="value"
            [style]="{'width': '100%'}"
            (onChange)="onSavingsAccountChange($event)">
          </p-select>
          <small class="form-error" *ngIf="withdrawForm.get('savingsAccountNumber')?.invalid && withdrawForm.get('savingsAccountNumber')?.touched">
            Vui lòng chọn tài khoản tiết kiệm
          </small>
        </div>

        <!-- Hiển thị thông tin tài khoản tiết kiệm -->
        <div class="account-info-card" *ngIf="selectedSavingsAccount">
          <div class="info-row">
            <span class="label">Số dư hiện tại:</span>
            <span class="value balance">{{ formatCurrency(selectedSavingsAccount.balance) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Kỳ hạn:</span>
            <span class="value">{{ selectedSavingsAccount.termValueMonths }} tháng</span>
          </div>
          <div class="info-row">
            <span class="label">Lãi suất:</span>
            <span class="value">{{ selectedSavingsAccount.interestRate * 100 }}%/năm</span>
          </div>
          <div class="info-row">
            <span class="label">Ngày mở:</span>
            <span class="value">{{ selectedSavingsAccount.openedDate | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <!-- Chọn tài khoản đích -->
        <div class="form-field">
          <label class="form-label">Tài khoản đích <span class="required">*</span></label>
          <p-select
            formControlName="destinationAccountNumber"
            [options]="paymentAccountOptions"
            placeholder="Chọn tài khoản nhận tiền"
            optionLabel="label"
            optionValue="value"
            [style]="{'width': '100%'}">
          </p-select>
          <small class="form-error" *ngIf="withdrawForm.get('destinationAccountNumber')?.invalid && withdrawForm.get('destinationAccountNumber')?.touched">
            Vui lòng chọn tài khoản đích
          </small>
        </div>

        <!-- Loại rút tiền -->
        <div class="form-field">
          <label class="form-label">Loại rút tiền <span class="required">*</span></label>
          <p-select
            formControlName="withdrawType"
            [options]="withdrawTypeOptions"
            placeholder="Chọn loại rút tiền"
            optionLabel="label"
            optionValue="value"
            [style]="{'width': '100%'}"
            (onChange)="onWithdrawTypeChange($event)">
          </p-select>
        </div>

        <!-- Số tiền rút -->
        <div class="form-field" *ngIf="withdrawForm.get('withdrawType')?.value">
          <label class="form-label">Số tiền rút <span class="required">*</span></label>
          <p-inputNumber
            formControlName="amount"
            mode="currency"
            currency="VND"
            locale="vi-VN"
            [min]="getMinAmount()"
            [max]="getMaxAmount()"
            placeholder="Nhập số tiền muốn rút"
            [style]="{'width': '100%'}"
           >
          </p-inputNumber>
          
          <div class="amount-info" *ngIf="selectedSavingsAccount">
            <p-message 
              *ngIf="withdrawForm.get('withdrawType')?.value === 'partial'"
              severity="info" 
              text="Số dư còn lại phải ít nhất 1.000.000 VND">
            </p-message>
            <p-message 
              *ngIf="withdrawForm.get('withdrawType')?.value === 'full'"
              severity="warn" 
              text="Tài khoản sẽ được đóng sau khi rút toàn bộ">
            </p-message>
          </div>
          
          <small class="form-error" *ngIf="withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched">
            <span *ngIf="withdrawForm.get('amount')?.errors?.['required']">Vui lòng nhập số tiền</span>
            <span *ngIf="withdrawForm.get('amount')?.errors?.['min']">Số tiền tối thiểu là {{ formatCurrency(getMinAmount()) }}</span>
            <span *ngIf="withdrawForm.get('amount')?.errors?.['max']">Số tiền tối đa là {{ formatCurrency(getMaxAmount()) }}</span>
          </small>
        </div>

        <!-- Ghi chú -->
       

        <div class="form-actions">
          <button 
            type="submit" 
            pButton 
            label="Tiếp tục" 
            icon="pi pi-arrow-right"
            iconPos="right"
            class="p-button"
            [disabled]="!withdrawForm.valid">
          </button>
        </div>
      </form>
    </p-card>
  `,
  styles: [`
    .form-field {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .required {
      color: #e74c3c;
    }

    .form-error {
      color: #e74c3c;
      margin-top: 0.25rem;
      display: block;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .account-info-card {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
    }

    .info-row .value {
      font-weight: 600;
      color: #333;
    }

    .info-row .value.balance {
      color: #28a745;
      font-size: 1.1rem;
    }

    .amount-info {
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `]
})
export class WithdrawStep1Component implements OnInit {
  @Input() savingsAccounts: AccountSavings[] = [];
  @Input() paymentAccounts: Account[] = [];
  @Output() formSubmit = new EventEmitter<any>();

  withdrawForm: FormGroup;
  selectedSavingsAccount: AccountSavings | null = null;
  
  savingsAccountOptions: any[] = [];
  paymentAccountOptions: any[] = [];
  withdrawTypeOptions = [
    { label: 'Rút một phần', value: 'partial' },
    { label: 'Rút toàn bộ', value: 'full' }
  ];

  constructor(private fb: FormBuilder) {
    this.withdrawForm = this.fb.group({
      savingsAccountNumber: ['', Validators.required],
      destinationAccountNumber: ['', Validators.required],
      withdrawType: ['', Validators.required],
      amount: [null],
    });
  }

  ngOnInit() {
    this.prepareAccountOptions();
    this.setupFormValidation();
    
  }

  prepareAccountOptions() {
    this.savingsAccountOptions = this.savingsAccounts.map(account => ({
      label: `${account.accountNumber} - ${this.formatCurrency(account.balance)}`,
      value: account.accountNumber
    }));

    this.paymentAccountOptions = this.paymentAccounts
      .filter(account => account.accountType === 'PAYMENT')
      .map(account => ({
        label: `${account.accountNumber} - ${account.accountType}`,
        value: account.accountNumber
      }));
  }

  setupFormValidation() {
    // Update amount validation when withdraw type changes
    this.withdrawForm.get('withdrawType')?.valueChanges.subscribe(type => {
      const amountControl = this.withdrawForm.get('amount');
      if (type === 'full' && this.selectedSavingsAccount) {
        amountControl?.setValue(this.selectedSavingsAccount.balance);
        amountControl?.clearValidators();
      } else if (type === 'partial') {
        amountControl?.setValue(null);
        amountControl?.setValidators([
          Validators.required,
          Validators.min(this.getMinAmount()),
          Validators.max(this.getMaxAmount())
        ]);
      }
      amountControl?.updateValueAndValidity();
    });
  }

  onSavingsAccountChange(event: any) {
    const accountNumber = event.value;
    this.selectedSavingsAccount = this.savingsAccounts.find(
      account => account.accountNumber === accountNumber
    ) || null;
    
    // Reset withdraw type and amount when changing account
    this.withdrawForm.patchValue({
      withdrawType: '',
      amount: null
    });
  }

  onWithdrawTypeChange(event: any) {
    const type = event.value;
    if (type === 'full' && this.selectedSavingsAccount) {
      this.withdrawForm.patchValue({
        amount: this.selectedSavingsAccount.balance
      });
    } else {
      this.withdrawForm.patchValue({
        amount: null
      });
    }
  }

  getMinAmount(): number {
    if (!this.selectedSavingsAccount) return 0;
    const withdrawType = this.withdrawForm.get('withdrawType')?.value;
    
    if (withdrawType === 'full') {
      return this.selectedSavingsAccount.balance;
    } else if (withdrawType === 'partial') {
      // Minimum withdrawal is 100,000 VND
      return 100000;
    }
    return 0;
  }

  getMaxAmount(): number {
    if (!this.selectedSavingsAccount) return 0;
    const withdrawType = this.withdrawForm.get('withdrawType')?.value;
    
    if (withdrawType === 'full') {
      return this.selectedSavingsAccount.balance;
    } else if (withdrawType === 'partial') {
      // Must leave at least 1,000,000 VND
      return this.selectedSavingsAccount.balance - 1000000;
    }
    return 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  onSubmit() {
    if (this.withdrawForm.valid) {
      this.formSubmit.emit(this.withdrawForm.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.withdrawForm.controls).forEach(key => {
        this.withdrawForm.get(key)?.markAsTouched();
      });
    }
  }
} 