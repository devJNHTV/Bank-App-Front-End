import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TransactionService } from '../../services/transaction.service';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { ConfirmTransactionComponent } from '../confirm/confirm-transaction.component.ts';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ConfirmTransactionComponent,
    DialogModule,
    DropdownModule,
    CardModule,
    Toast,
    Textarea,
  ],
  providers: [MessageService],
})
export class DepositComponent implements OnInit {
  depositForm!: FormGroup;
  submitted = false;

  someDepositData: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
    currency: string;
    referenceCode: string;
    toCustomerName: string | null;
    fromCustomerName: string | null;
    type: string;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private messageService: MessageService,
    private location: Location
  ) {
    this.depositForm = this.fb.group({
      toAccountNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1000)]],
      currency: [this.currencyOptions[0].currencyCode, Validators.required],
      description: [''],
    });
    this.selectedBalance = this.toAccountOptions[0]?.balance || null;
  }

  toAccountOptions: any[] = [];
  toCustomerName: string | null = null;
  fromCustomerName: string | null = null;

  ngOnInit(): void {
    this.transactionService.getAccountForCustomer().subscribe({
      next: (res) => {
        console.log(res);
        this.toAccountOptions = res.result.map((acc: any) => ({
          accountNumber: acc.accountNumber,
          accountDescription: `Tài khoản thanh toán - ${acc.accountNumber}`,
          balance: acc.balance,
        }));
        if (this.toAccountOptions.length > 0) {
          this.depositForm.patchValue({
            toAccountNumber: this.toAccountOptions[0].accountNumber,
          });
          this.selectedBalance = this.toAccountOptions[0].balance;
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách tài khoản:', err);
      },
    });
    // Get Current Customer
    this.transactionService.getCurrentCustomer().subscribe({
      next: (res) => {
        this.toCustomerName = this.removeVietnameseTones(
          res.result.fullName.toUpperCase()
        );
        this.depositForm.patchValue({
          description: this.toCustomerName + ' NAP TIEN',
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy khách hàng hiện tại:', err);
      },
    });
  }

  currencyOptions = [
    { currencyName: 'Việt Nam Đồng (VND)', currencyCode: 'VND' },
    { currencyName: 'US Dollar (USD)', currencyCode: 'USD' },
    { currencyName: 'Euro (EUR)', currencyCode: 'EUR' },
  ];

  selectedBalance: number | null = null;

  showConfirmForm = false;
  onAccountChange(event: any) {
    const selectedAccountNumber = event.value;
    const account = this.toAccountOptions.find(
      (acc) => acc.accountNumber === selectedAccountNumber
    );
    this.selectedBalance = account ? account.balance : null;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.depositForm.valid) {
      this.someDepositData = {
        fromAccountNumber: '',
        toAccountNumber: String(this.depositForm.get('toAccountNumber')?.value),
        amount: this.depositForm.get('amount')?.value,
        description: this.depositForm.get('description')?.value,
        currency: this.depositForm.get('currency')?.value,
        referenceCode: '',
        toCustomerName: this.toCustomerName,
        fromCustomerName: this.fromCustomerName,
        type: 'DEPOSIT',
      };
      this.transactionService.deposit(this.someDepositData).subscribe({
        next: (res) => {
          console.log('Phản hồi từ server:', res);
          this.showSuccess(
            'Giao dịch nộp tiền đã khởi tạo thành công. Vui lòng xác nhận OTP.'
          );
          if (this.someDepositData) {
            this.someDepositData.referenceCode = res.result.referenceCode;
          }
          this.showConfirmForm = true;
        },
        error: (err) => {
          console.error('Lỗi khi gửi dữ liệu:', err.message);
          this.showError(
            'Nộp tiền thất bại: ' + (err.error?.message || err.message)
          );
        },
      });
    }
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Khởi tạo giao dịch thành công. Vui lòng xác nhận OTP',
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
  onCancelConfirm() {
    this.someDepositData = null;
    this.showConfirmForm = false;
    this.submitted = false;
  }
  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  goBack(): void {
    this.location.back();
  }
}
