import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Account } from '../../../interfaces/account.interface';
import { AccountService } from '../../../services/account/account.service';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './credit.component.html',
  styleUrl: './credit.component.scss'
})
export class CreditComponent implements OnInit {
  accounts: Account[] = [];
  loading: boolean = false;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách tài khoản:', error);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getCreditStatus(balance: number): 'success' | 'warn' | 'danger' {
    if (balance >= 50000000) return 'success';
    if (balance >= 10000000) return 'warn';
    return 'danger';
  }

  trackByAccountNumber(index: number, account: Account): string {
    return account.accountNumber;
  }
}
