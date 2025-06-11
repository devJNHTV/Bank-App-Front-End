import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../models/loan.model';
import { Repayment } from '../../models/repayment.model';

@Component({
  selector: 'app-detail-loan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-loan.component.html',
  styleUrls: ['./detail-loan.component.scss']
})
export class DetailLoanComponent implements OnInit {
  loanDetail: Loan | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private loanService: LoanService
  ) {}

  ngOnInit() {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoanDetail(Number(loanId));
    }
  }

  loadLoanDetail(loanId: number) {
    this.loading = true;
    this.loanService.getLoanById(loanId).subscribe({
      next: (response) => {
        this.loanDetail = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load loan details';
        this.loading = false;
        console.error('Error loading loan detail:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';
      case 'PARTIAL':
        return 'status-partial';
      case 'UNPAID':
        return 'status-unpaid';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }
} 