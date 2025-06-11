// loan-detail-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan.model';
import { LoanStatus } from '../../models/loanStatus .model';

type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-loan-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    Textarea,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    InputNumberModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './loan-detail-view.component.html',
  styleUrls: ['./loan-detail-view.component.scss']
})
export class LoanDetailViewComponent implements OnInit {
  loanDetail: Loan | null = null;
  customerInfo: any = null;
  accounts: any[] = [];
  loading = true;
  error: string | null = null;

  showRejectDialog = false;
  showEditDialog = false;
  processingAction = false;
  rejectionReasonControl = new FormControl('');
  
  // Form for editing loan details
  loanForm = new FormGroup({
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1000000)]),
    interestRate: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    termMonths: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    declaredIncome: new FormControl<number | null>(null, [Validators.required, Validators.min(0)])
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private messageService: MessageService
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
        if (data.customerId) {
          this.loadCustomerInfo(data.customerId);
          this.loadAccounts(data.customerId);
        }
        // Initialize form with current loan values
        if (data.status === 'REJECTED') {
          this.loanForm.patchValue({
            amount: data.amount,
            interestRate: data.interestRate,
            termMonths: data.termMonths,
            declaredIncome: data.declaredIncome
          });
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load loan details';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error! });
      }
    });
  }

  loadCustomerInfo(customerId: number) {
    // giả lập dữ liệu
    this.customerInfo = {
      cifCode: "CIF00000005",
      fullName: "Test User",
      address: "123 ABC Street",
      email: "test3@example.com",
      dateOfBirth: "2024-01-05",
      phoneNumber: "0123456783",
      status: "ACTIVE",
      kycStatus: "REJECTED"
    };
  }

  loadAccounts(customerId: number) {
    this.accounts = [
      {
        accountNumber: "27654321",
        cifCode: "CIF00000005",
        accountType: "PAYMENT",
        balance: 20000000,
        status: "ACTIVE",
        openedDate: "2024-01-05"
      },
      {
        accountNumber: "37154329",
        cifCode: "CIF00000005",
        accountType: "PAYMENT",
        balance: 100000,
        status: "ACTIVE",
        openedDate: "2024-01-01"
      }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  formatDate(dateString: string | null): string {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';
  }

  getStatusSeverity(status: LoanStatus | string | null | undefined): Severity {
    const s = (status ?? '').toString().toUpperCase();
    switch (s) {
      case 'APPROVED': return 'success';
      case 'PENDING':  return 'warn';
      case 'REJECTED': return 'danger';
      default:         return 'info';
    }
  }

  approveLoan() {
    if (!this.loanDetail?.loanId) return;
    this.processingAction = true;
    this.loanService.approveLoan(this.loanDetail.loanId).subscribe({
      next: () => {
        this.processingAction = false;
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Loan approved successfully' });
        this.router.navigate(['/employee/loans/pending']);
      },
      error: () => {
        this.processingAction = false;
        this.error = 'Failed to approve loan';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      }
    });
  }

  openRejectDialog() {
    this.showRejectDialog = true;
    this.rejectionReasonControl.reset();
  }

  closeRejectDialog() {
    this.showRejectDialog = false;
    this.rejectionReasonControl.reset();
  }

  rejectLoan() {
    if (!this.loanDetail?.loanId) return;
    const reason = this.rejectionReasonControl.value?.trim();
    if (!reason) return;

    this.processingAction = true;
    this.loanService.rejectLoan(this.loanDetail.loanId, {
      loan_id: this.loanDetail.loanId,
      reason,
      createdAt: null
    }).subscribe({
      next: () => {
        this.processingAction = false;
        this.messageService.add({ severity: 'success', summary: 'Rejected', detail: 'Loan rejected' });
        this.closeRejectDialog();
        this.router.navigate(['/employee/loans/pending']);
      },
      error: () => {
        this.processingAction = false;
        this.error = 'Failed to reject loan';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      }
    });
  }

  openEditDialog() {
    this.showEditDialog = true;
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.loanForm.reset();
    if (this.loanDetail) {
      this.loanForm.patchValue({
        amount: this.loanDetail.amount,
        interestRate: this.loanDetail.interestRate,
        termMonths: this.loanDetail.termMonths,
        declaredIncome: this.loanDetail.declaredIncome
      });
    }
  }

  // updateAndResubmitLoan() {
  //   if (!this.loanDetail?.loanId || !this.loanForm.valid) return;

  //   const updatedLoan: Loan = {
  //     ...this.loanDetail,
  //     ...this.loanForm.value,
  //     status: 'PENDING' // Change status to PENDING for resubmission
  //   };

  //   this.processingAction = true;
  //   this.loanService.updateLoan(updatedLoan).subscribe({
  //     next: () => {
  //       this.processingAction = false;
  //       this.messageService.add({ 
  //         severity: 'success', 
  //         summary: 'Success', 
  //         detail: 'Loan updated and resubmitted successfully' 
  //       });
  //       this.closeEditDialog();
  //       this.router.navigate(['/customer/loans']);
  //     },
  //     error: () => {
  //       this.processingAction = false;
  //       this.error = 'Failed to update and resubmit loan';
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
  //     }
  //   });
  // }
}
