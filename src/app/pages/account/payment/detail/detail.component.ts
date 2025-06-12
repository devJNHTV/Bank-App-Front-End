import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { MenubarModule } from 'primeng/menubar';                         
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';  
import { PaginatorModule } from 'primeng/paginator';
import { Account } from '../../../../interfaces/account.interface';
import { AccountService } from '../../../../services/account/account.service';
import { Customer } from '../../../../interfaces/customer.inteface';
import { CustomerService } from '../../../../services/customer/customer.service'; 
import { Transaction } from '../../../../interfaces/account.interface';
              
  @Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DropdownModule, TableModule, MenubarModule, TagModule, TooltipModule, PaginatorModule],
    templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent {
  account : Account = {
    accountNumber: '',
    balance: 0,
    status: '',
    openedDate: new Date(),
    accountType: ''
  };
  customer : Customer = {
    cifCode: '',
    fullName: '',
    address: '',
    email: '',
    dateOfBirth: new Date(),
    phoneNumber: '',
    status: '',
    identityNumber: ''
  };
  transactions : Transaction[] = [];
  accountNumber: string = '';

  // Pagination properties
  first: number = 0;
  rows: number = 8;
  totalRecords: number = 0;
  currentPage: number = 0;

  // selectedTimeFilter = this.timeFilters[0];

  constructor(private router: Router,
      private route: ActivatedRoute,
      private accountService: AccountService,
      private customerService: CustomerService  
    ) {}

  ngOnInit() {
    this.accountNumber = this.route.snapshot.paramMap.get('accountNumber') || '';
    this.accountService.getAccountByAccountNumber(this.accountNumber).subscribe((res : any) => {
      this.account = res.data;
      console.log(this.account);
    });
    this.customerService.getCustomerInfo().subscribe((res : any) => {
      this.customer = res.data;
      console.log(this.customer);
    });
    this.loadTransactions();
  }

  loadTransactions() {
    this.accountService.getTransactions(this.accountNumber, this.currentPage, this.rows).subscribe((res : any) => {
      console.log('Transaction response:', res.result);
      this.transactions = res.result.content;
      //tong giao dich
      this.totalRecords = res.result.totalElements;
      console.log('Transactions:', this.transactions);
      console.log('Total records:', this.totalRecords);
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.currentPage = event.page;
    this.loadTransactions();
  }
  transfer() {
    this.router.navigate(['/transfer']);
  }

  deposit() {
    this.router.navigate(['/deposit']);
  }

  lockAccount() {
    console.log('Khóa tài khoản');
  }

  // filterTransactions() {
  //   console.log('Lọc giao dịch:', this.searchQuery, this.selectedTimeFilter);
  // }

  exportTransactions() {
    console.log('Xuất PDF');
  }

  payLoan(loan: any) {
    this.router.navigate(['/loan-payment', loan.loanId]);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  goToDetail(accountNumber: string): void {
    if (!accountNumber) {
      console.error('Số tài khoản không hợp lệ');
      return;
    }
    this.router.navigate(['/account/payment/detail', accountNumber]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN');
  }
  copyAccountNumber() {
    navigator.clipboard.writeText(this.accountNumber);
  }
  
}
