// src/app/loan/apply-new-loan/apply-new-loan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account/account.service';
import { LoanService } from '../../services/loan.service';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { Loan} from '../../models/loan.model';
import {Account } from '../../interfaces/account.interface'
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-apply-new-loan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: './apply-newloan.component.html',
  styleUrls: ['./apply-newloan.component.scss'],
  providers: [MessageService]
})
export class ApplyNewLoanComponent implements OnInit {
  loanForm: FormGroup;
  accounts: Account[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private loanService: LoanService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loanForm = this.fb.group({
      accountNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1000000)]], // Tối thiểu 1 triệu
      interestRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      termMonths: [null, [Validators.required, Validators.min(1), Validators.max(360)]], // 1 tháng đến 30 năm
      declaredIncome: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe((res: any) => {
      this.accounts = res.data;
      console.log(this.accounts);
    });
  }

  onSubmit(): void {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const loan: Loan = {
      accountNumber: this.loanForm.value.accountNumber,
      amount: this.loanForm.value.amount,
      interestRate: this.loanForm.value.interestRate,
      termMonths: this.loanForm.value.termMonths,
      declaredIncome: this.loanForm.value.declaredIncome,
      customerId: null,
      loanId:null,
      approvedAt:null,
      createdAt:null,
      repayments:null,
      status:'PENDING'
    };
    console.log(loan);
    
    this.loanService.createLoan(loan).subscribe({
      next: (response: ApiResponseWrapper<Loan>) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đăng ký khoản vay thành công!'
        });
        setTimeout(() => this.router.navigate(['']), 2000); // Quay về dashboard
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating loan:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể đăng ký khoản vay.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['']);
  }
}