// loan-detail-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account/account.service';
import { Account } from '../../interfaces/account.interface';
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
import { ToastrService } from 'ngx-toastr';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan.model';
import { LoanStatus } from '../../models/loanStatus .model';
import { DividerModule } from 'primeng/divider';

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
    InputNumberModule,
    DividerModule
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
  accounts: Account[] = [];
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
    private messageService: MessageService,
    private accountService: AccountService,
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
        if (data.customerId) {
          this.loadCustomerInfo(data.customerId);
          this.loadAccounts();
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
  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data;
        console.log(this.accounts);
        
      },
      error: (err) => {
        console.error('Không tải được danh sách tài khoản:', err);
        this.toastr.error('Lỗi khi tải danh sách tài khoản.', 'Lỗi');
      }
    });
  }

  approveLoan() {
    this.processingAction = true;
    this.loanService.approveLoan(this.loanDetail?.loanId ?? 0).subscribe({
      next: () => {
        this.processingAction = false;
        this.toastr.success( 'Kích hoạt khoản vay thành công!', 'Thành công');
        this.router.navigate(['/employee/loans/pending']);
      },
      error: (err) => {
        this.processingAction = false;
        console.log(err);
        this.toastr.error( err.error.message, 'Thất bại');
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
    console.log(this.loanDetail);
    
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
        this.toastr.success( 'TỪ chối khoản vay thành công!', 'Thành công');
        this.closeRejectDialog();
        this.router.navigate(['/detail/loan/'+this.loanDetail?.loanId]);
      },
      error: (err) => {
        this.processingAction = false;
        this.toastr.error( err.error.message, 'Thất bại');
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
}
