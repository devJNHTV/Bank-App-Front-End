import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan.model';
import { LoanStatus } from '../../models/loanStatus .model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail-loan-reject',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    ToastModule,
    TagModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './detail-loan-reject.component.html',
  styleUrls: ['./detail-loan-reject.component.scss']
})
export class DetailLoanRejectComponent implements OnInit {
  loanDetail: Loan | null = null;
  loading = true;
  error: string | null = null;
  processingAction = false;

  // Form for editing loan details
  loanForm = new FormGroup({
    amount: new FormControl<number | null>(null, [
      Validators.required, 
      Validators.min(1000000)
    ]),
    interestRate: new FormControl<number | null>(null, [
      Validators.required, 
      Validators.min(0),
      Validators.max(100)
    ]),
    termMonths: new FormControl<number | null>(null, [
      Validators.required, 
      Validators.min(1)
    ]),
    declaredIncome: new FormControl<number | null>(null, [
      Validators.required, 
      Validators.min(0)
    ])
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private messageService: MessageService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoanDetail(+loanId);
    }
  }

  loadLoanDetail(loanId: number) {
    this.loading = true;
    this.loanService.getLoanById(loanId).subscribe({
      next: ({ data }) => {
        this.loanDetail = data;
        // Initialize form with current loan values
        this.loanForm.patchValue({
          amount: data.amount,
          interestRate: data.interestRate,
          termMonths: data.termMonths,
          declaredIncome: data.declaredIncome
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load loan details';
        this.loading = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: this.error 
        });
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  }

  formatDate(dateString: string | null): string {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';
  }

  getStatusSeverity(status: LoanStatus | string | null | undefined): string {
    const s = (status ?? '').toString().toUpperCase();
    switch (s) {
      case 'APPROVED': return 'success';
      case 'PENDING':  return 'warn';
      case 'REJECTED': return 'danger';
      default:         return 'info';
    }
  }

  updateAndResubmitLoan() {
    if (!this.loanDetail?.loanId || !this.loanForm.valid) return;

    const updatedLoan: Loan = {
      loanId: this.loanDetail.loanId,
      customerId: this.loanDetail.customerId,
      accountNumber: this.loanDetail.accountNumber,
      createdAt: this.loanDetail.createdAt,
      approvedAt: this.loanDetail.approvedAt,
      rejectionReasons: this.loanDetail.rejectionReasons,
      amount: this.loanForm.value.amount ?? 0,  
      interestRate: this.loanForm.value.interestRate ?? 0,
      termMonths: this.loanForm.value.termMonths ?? 0,
      declaredIncome: this.loanForm.value.declaredIncome ?? 0,
      status: LoanStatus.PENDING,
      repayments: this.loanDetail.repayments ?? []
    };
    console.log(updatedLoan);
    

    this.processingAction = true;
    this.loanService.updateLoan(updatedLoan).subscribe({
      next: () => {
        this.processingAction = false;
        this.toastr.success('Cập nhật và gửi lại khoản vay thành công!', 'Thành công');
        this.router.navigate(['/loans/overview']);
      },
      error: () => {
        this.processingAction = false;
        this.error = 'Failed to update and resubmit loan';
        this.toastr.error(this.error, 'Thất bại');
      }
    });
  }
} 