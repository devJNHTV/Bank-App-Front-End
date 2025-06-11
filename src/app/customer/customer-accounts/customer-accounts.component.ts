import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserService } from '../../core/services/user.service';

interface AccountData {
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './customer-accounts.component.html',
  styleUrls: ['./customer-accounts.component.scss']
})
export class CustomerAccountsComponent implements OnInit {
  accounts: AccountData[] = [];
  displayedColumns: string[] = ['accountNumber', 'accountType', 'balance', 'status', 'createdAt'];
  isLoading = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<AccountData>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.userService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (this.table) {
          this.table.renderRows();
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load accounts'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((total, account) => total + account.balance, 0);
  }

  getActiveAccounts(): number {
    return this.accounts.filter(account => account.status === 'ACTIVE').length;
  }
} 