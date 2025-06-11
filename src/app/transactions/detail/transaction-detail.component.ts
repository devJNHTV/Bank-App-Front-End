import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  providers: [MessageService]
})
export class TransactionDetailComponent implements OnInit {
  transaction: any = null;
  error: string | null = null;
  fromCustomerName: string = '';
  toCustomerName: string = '';
  accountNumber: string = '';
  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private location: Location,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.accountNumber = params['accountNumber'];
    });
    this.loadTransaction();
   
  }
  loadCustomerName(fromAccountNumber: string, toAccountNumber: string) {
    this.transactionService.getCustomerByAccountNumber(fromAccountNumber).subscribe({
      next: (response: any) => {
        this.fromCustomerName    = this.removeVietnameseTones(response.data.fullName.toUpperCase());
        console.log(this.fromCustomerName);
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải thông tin khách hàng';
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin khách hàng'
        });
      }
    });
    this.transactionService.getCustomerByAccountNumber(toAccountNumber).subscribe({
      next: (response: any) => {
        this.toCustomerName    = this.removeVietnameseTones(response.data.fullName.toUpperCase());  
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải thông tin khách hàng';
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin khách hàng'
        });
      }
    });
  }
  loadTransaction() {
    const referenceCode = this.route.snapshot.paramMap.get('referenceCode');
    if (!referenceCode) {
      this.error = 'Không tìm thấy mã giao dịch';
      return;
    }

    this.error = null;
    this.transaction = null;

    this.transactionService.getTransactionByReferenceCode(referenceCode).subscribe({
      next: (response: any) => {
        this.transaction = response.result;     
        console.log(this.transaction);
        this.loadCustomerName(this.transaction.fromAccountNumber, this.transaction.toAccountNumber);
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải thông tin giao dịch';
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin giao dịch'
        });
      }
    });
  }

  getTransactionType(type: string): string {
    switch (type) {
      case 'TRANSFER':
        return 'Chuyển khoản';
      case 'DEPOSIT':
        return 'Nạp tiền';
      case 'WITHDRAW':
        return 'Rút tiền';
      default:
        return 'Không xác định';
    }
  }

  getTransactionStatus(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'PENDING':
        return 'Đang xử lý';
      case 'FAILED':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  }
removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
  goBack() {
    this.router.navigate(['/transactions/history'], {       
        queryParams: { accountNumber: this.accountNumber }
      });
  }
}
