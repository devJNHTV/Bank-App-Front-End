import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AccountService } from '../../services/account/account.service';
import { LoanService } from '../../services/loan.service';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { Loan } from '../../models/loan.model';
import { Account } from '../../interfaces/account.interface';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { LoanStatus } from "../../models/loanStatus .model";
import { ToastrService } from 'ngx-toastr';


// 2. termMonths ≤ maxTerm(amount)
function termMaxByAmountValidator(amountControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const amount = amountControl.value;
    const term = control.value;
    if (amount != null && term != null) {
      let maxTerm = 0;
      if (amount <= 50_000_000) {
        maxTerm = 60;
      } else if (amount <= 200_000_000) {
        maxTerm = 120;
      } else {
        maxTerm = 240;
      }
      return term > maxTerm
        ? { termTooLong: { actual: term, maxTerm } }
        : null;
    }
    return null;
  };
}

// 3. lãi suất tự tính: baseRate(term) + điều chỉnh theo amount
function computeInterestRate(amount: number, term: number): number {
  let baseRate = 0;
  if (term <= 12) {
    baseRate = 5;
  } else if (term <= 60) {
    baseRate = 10;
  } else {
    baseRate = 15;
  }

  let extra = 0;
  if (amount > 200_000_000) {
    extra = 1;    
  } else if (amount > 50_000_000) {
    extra = 0.5;   
  }
  return +(baseRate + extra); 
}

@Component({
  selector: 'app-apply-new-loan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule
  ],
  templateUrl: './apply-newloan.component.html',
  styleUrls: ['./apply-newloan.component.scss']
})
export class ApplyNewLoanComponent implements OnInit {
  loanForm: FormGroup;
  accounts: Account[] = [];
  loading = true; 
  computedRate: number | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private loanService: LoanService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Khởi tạo form với updateOn: 'blur' để validate khi blur khỏi ô
    this.loanForm = this.fb.group(
      {
        accountNumber: ['', Validators.required],
        declaredIncome: [
          null,
          [Validators.required, Validators.min( 5_000_000)]
        ],
        amount: [
          null,
          [Validators.required, Validators.min(1_000_000)]
        ],
        termMonths: [
          null,
          [Validators.required, Validators.min(1), Validators.max(240)]
        ],
        interestRate: [{ value: null, disabled: true }]
      }
    );
  }

  // Các getter để dễ truy xuất control
  get declaredIncomeControl() {
    return this.loanForm.get('declaredIncome')!;
  }
  get amountControl() {
    return this.loanForm.get('amount')!;
  }
  get termControl() {
    return this.loanForm.get('termMonths')!;
  }
  get rateControl() {
    return this.loanForm.get('interestRate')!;
  }

  ngOnInit(): void {
    this.loanService.getLoansByCustomerId().then(obs => {
      obs.subscribe({
        next: (res) => {
          const loans = res.data || [];
          const hasActiveLoan = loans.some((loan: Loan) => loan.status === 'APPROVED' || loan.status === 'PENDING');
          if (hasActiveLoan) {
            this.router.navigate(['/loan/warning-apply-loan']);
          } else {
            this.loadAccounts();
          }
        },
        error: (err) => {
          this.loadAccounts();
        }
      });
    });
    // this.loadAccounts();
    this.declaredIncomeControl.valueChanges.subscribe(() => {
      this.amountControl.setValidators([
        Validators.required,
        Validators.min(1_000_000)
      ]);
      this.amountControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    // 2. Khi amount blur → gán validator cho termMonths & tính lãi suất
    this.amountControl.valueChanges.subscribe((amt) => {
      this.termControl.setValidators([
        Validators.required,
        Validators.min(1),
        termMaxByAmountValidator(this.amountControl)
      ]);
      this.termControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      const term = this.termControl.value;
      if (amt != null && term != null && !isNaN(term)) {
        this.computedRate = computeInterestRate(amt, term);
        this.rateControl.setValue(this.computedRate, { emitEvent: false });
          console.log(this.loanForm.value.interestRate.value);
      }
    });

    // 3. Khi termMonths blur → tính lãi suất
    this.termControl.valueChanges.subscribe((term) => {
      const amt = this.amountControl.value;
      if (amt != null && term != null && !isNaN(amt)) {
        this.computedRate = computeInterestRate(amt, term);
        this.rateControl.setValue(this.computedRate, { emitEvent: false });
          console.log(this.loanForm.value);
      }
    });

  
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data;
        console.log(this.accounts);
        
      },
      error: (err) => {
        console.error('Không tải được danh sách tài khoản:', err);
        this.toastr.error('Lỗi khi tải danh sách tài khoản.', 'Lỗi');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading =true;
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }
    const loan: Loan = {
      accountNumber: this.loanForm.value.accountNumber,
      amount: this.loanForm.value.amount,
      interestRate: this.loanForm.value.interestRate, 
      termMonths: this.loanForm.value.termMonths,
      declaredIncome: this.loanForm.value.declaredIncome,
      customerId: null,
      loanId: null,
      approvedAt: null,
      createdAt: null,
      repayments: null,
      status:LoanStatus.PENDING,
      rejectionReasons: null
    };
    this.loanForm.get('interestRate')?.setValue(  this.rateControl.value);
    console.log(this.rateControl.value);
    console.log(this.loanForm.value.interestRate);
    loan.interestRate = this.rateControl.value;
    console.log(loan);
    this.loanService.createLoan(loan).subscribe({
      next: (response: ApiResponseWrapper<Loan>) => {
        this.loading = false;
        this.toastr.success(response.message || 'Đăng ký khoản vay thành công!', 'Thành công');
        this.onLoanCreated();
      },
      error: (httpError: HttpErrorResponse) => {
        console.log(httpError);
        
        this.toastr.error( `Lỗi: ${httpError.error.message}`,'Lỗi');
      }
    });
  }

  onLoanCreated() {
    
    setTimeout(() => {
      this.router.navigate(['/loans/overview']);
    }, 2000);
  }
}
