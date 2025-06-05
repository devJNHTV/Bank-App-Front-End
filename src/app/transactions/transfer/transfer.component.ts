import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { TransactionService } from '../../services/transaction.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { Textarea } from 'primeng/textarea';
import { ConfirmTransactionComponent } from '../confirm/confirm-transaction.component.ts';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    InputNumberModule,
    NgFor,
    DropdownModule,
    Textarea,
    CommonModule,
    ConfirmTransactionComponent,
    ToastModule
  ],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
})
export class TransferComponent implements OnInit{
  transferForm!: FormGroup;
  submitted = false;

  someTransferData: {
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
    currency: string;
  } | null = null;

  
  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.transferForm = this.fb.group({
      fromAccountNumber: [null, Validators.required],
      toAccountNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1000)]],
      currency: [this.currencyOptions[0].currencyCode, Validators.required],
      description: [''],
    });
    this.selectedBalance = this.fromAccountOptions[0]?.balance || null;
    
  }
  fromAccountOptions: any[] = [];
  
  ngOnInit(): void {
    this.transactionService.getAccountForCustomer().subscribe({
      next: (res) => {
        console.log(res);
        this.fromAccountOptions = res.data.map((acc: any) => ({
          accountNumber: acc.accountNumber,
          accountDescription: `Tài khoản thanh toán - ${acc.accountNumber}`,
          balance: acc.balance
        }));
        if (this.fromAccountOptions.length > 0) {
          this.transferForm.patchValue({
            fromAccountNumber: this.fromAccountOptions[0].accountNumber,
          });
          this.selectedBalance = this.fromAccountOptions[0].balance;
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách tài khoản:', err);
      }
    });
  }
  
  currencyOptions = [
    { currencyName: 'Việt Nam Đồng (VND)', currencyCode: 'VND' },
    { currencyName: 'US Dollar (USD)', currencyCode: 'USD' },
    { currencyName: 'Euro (EUR)', currencyCode: 'EUR' },
    
  ];
  
  
  selectedBalance: number | null = null;
  showConfirmForm = false;
  onFromAccountChange(event: any) {
    const selectedAccountNumber = event.value;
    const account = this.fromAccountOptions.find(
      (acc) => acc.accountNumber === selectedAccountNumber
    );
    this.selectedBalance = account ? account.balance : null;
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.transferForm.valid) {
      this.someTransferData = {
        fromAccountNumber: this.transferForm.get('fromAccountNumber')?.value,
        toAccountNumber: String(this.transferForm.get('toAccountNumber')?.value),
        amount: this.transferForm.get('amount')?.value,
        description: this.transferForm.get('description')?.value,
        currency: this.transferForm.get('currency')?.value,
      };
      console.log('Dữ liệu gửi lên server:', this.someTransferData);
    }

    this.transactionService.transfer(this.someTransferData).subscribe({
      next: (res) => {
        console.log('Phản hồi từ server:', res);
        alert('Giao dịch chuyển khoản đã khởi tạo thành công. Vui lòng xác nhận OTP.');
        this.showConfirmForm = true; 
      },
      error: (err) => {
        console.error('Lỗi khi gửi dữ liệu:', err);
        alert('Chuyển khoản thất bại: ' + err.error?.message || err.message);
      }
    });
  }
  onCancelConfirm() {
    this.someTransferData = null;
    this.showConfirmForm = false;
    this.submitted = false;
  }
}

