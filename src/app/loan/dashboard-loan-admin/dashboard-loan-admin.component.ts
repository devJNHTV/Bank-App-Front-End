import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';
import { LoanService } from '../../services/loan.service';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';

@Component({
  selector: 'app-dashboard-loan-admin',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, PanelModule, ProgressSpinnerModule, ChartModule],
  templateUrl: './dashboard-loan-admin.component.html',
  styleUrls: ['./dashboard-loan-admin.component.scss']
})
export class DashboardLoanAdminComponent implements OnInit {
  loading = true;
  // Thống kê tổng quan
  totalBorrowed = 0;
  totalOutstanding = 0;
  totalInterest = 0;
  totalLoans = 0;
  totalClosedLoans = 0;
  totalLateLoans = 0;
  totalRejectedLoans = 0;

  // Chart data
  barChartData: any;
  barChartOptions: any;
  pieChartData: any;
  pieChartOptions: any;

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loading = true;
    // Gọi API song song
    Promise.all([
      this.loanService.getTotalDisbursedSystem().toPromise(),
      this.loanService.getTotalCollectedSystem().toPromise(),
      this.loanService.getTotalProfitSystem().toPromise(),
      this.loanService.getAllLoans().toPromise()
    ]).then(([disbursed, collected, profit, allLoans]) => {
      this.totalBorrowed = disbursed?.data || 0;
      this.totalOutstanding = (disbursed?.data || 0) - (collected?.data || 0);
      this.totalInterest = profit?.data || 0;
      // Thống kê số lượng
      const loans = allLoans?.data || [];
      this.totalLoans = loans.length;
      this.totalClosedLoans = loans.filter((l: any) => l.status === 'CLOSED').length;
      this.totalLateLoans = loans.filter((l: any) => l.status === 'LATE').length;
      this.totalRejectedLoans = loans.filter((l: any) => l.status === 'REJECTED').length;
      // Cập nhật biểu đồ
      this.barChartData = {
        labels: ['Đã giải ngân', 'Đã thu hồi', 'Tiền lãi'],
        datasets: [
          {
            label: 'Số tiền (VNĐ)',
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
            data: [this.totalBorrowed, collected?.data || 0, this.totalInterest]
          }
        ]
      };
      this.barChartOptions = {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Thống kê khoản vay' }
        }
      };
      this.pieChartData = {
        labels: ['Đã giải ngân', 'Đã thu hồi', 'Tiền lãi'],
        datasets: [
          {
            data: [this.totalBorrowed, collected?.data || 0, this.totalInterest],
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
            hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D']
          }
        ]
      };
      this.pieChartOptions = {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Tỷ lệ khoản vay' }
        }
      };
      this.loading = false;
    });
  }
} 