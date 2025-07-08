import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepaymentService } from '../../services/repayment.service';
import { Repayment } from '../../models/repayment.model';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';  
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { PrimeNG } from 'primeng/config';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeVi, 'vi');
@Component({
  selector: 'app-loan-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    BadgeModule,
    CalendarModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, { provide: LOCALE_ID, useValue: 'vi' },PrimeNG],
  templateUrl: './loan-history.component.html',
  styleUrls: ['./loan-history.component.scss']
})
export class LoanHistoryComponent implements OnInit {
  repayments: Repayment[] = [];
  filteredRepayments: Repayment[] = [];
  loading = false;
  error: string | null = null;
  dateRange: Date[] = [];
  expandedRows: { [key: number]: boolean } = {};
  viLocale: any = {
    firstDayOfWeek: 1,
    dayNames: ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],
    dayNamesShort: ["CN","T2","T3","T4","T5","T6","T7"],
    dayNamesMin:   ["CN","T2","T3","T4","T5","T6","T7"],   
    monthNames: ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],
    monthNamesShort: ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],
    today: 'Hôm nay',
    clear: 'Xóa'
  };
  
  constructor(
    private repaymentService: RepaymentService,
    private messageService: MessageService,
    private primeng: PrimeNG
  ) {}

  ngOnInit(): void {
    this.loadRepaymentHistory();
    this.primeng.setTranslation(this.viLocale);
  }

  loadRepaymentHistory(): void {
    this.loading = true;
    this.error = null;

    this.repaymentService.getRepaymentHistory().subscribe({
      next: (response: ApiResponseWrapper<Repayment[]>) => {
        if (response.status === 200) {
          this.repayments = response.data;
          this.filteredRepayments = [...this.repayments];
        } else {
          this.error = response.message || 'Failed to load repayment history';
          this.showNotification('error', 'Error', this.error);
        }
      },
      error: (err) => {
        console.log(err);
        
        this.error = 'Error loading repayment history';
        this.showNotification('error', 'Error', this.error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  applyDateFilter(): void {
    if (!this.dateRange || this.dateRange.length !== 2) {
      this.filteredRepayments = [...this.repayments];
      return;
    }

    const startDate = this.dateRange[0];
    const endDate = this.dateRange[1];

    this.filteredRepayments = this.repayments.filter(repayment => {
      const dueDate = new Date(repayment.dueDate);
      return dueDate >= startDate && dueDate <= endDate;
    });
  }

  clearDateFilter(): void {
    this.dateRange = [];
    this.filteredRepayments = [...this.repayments];
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'UNPAID':
        return 'danger';
      case 'LATE':
        return 'danger';
      default:
        return 'info';
    }
  }
  calculateTotalPaid(): number {
    return this.repayments.reduce((total, repayment) => total + repayment.paidAmount, 0);
  }

  calculateTotalAmount(repayment: Repayment): number {
    return repayment.principal + repayment.interest;
  }

  calculateRemainingAmount(repayment: Repayment): number {
    return this.calculateTotalAmount(repayment) - repayment.paidAmount;
  }

  private showNotification(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail
    });
  }
} 