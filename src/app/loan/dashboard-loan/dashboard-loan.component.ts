import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-loan',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, PanelModule, ProgressSpinnerModule, ChartModule],
  templateUrl: './dashboard-loan.component.html',
  styleUrls: ['./dashboard-loan.component.scss']
})
export class DashboardLoanComponent implements OnInit {
  totalBorrowed: number = 0;
  totalOutstanding: number = 0;
  loading: boolean = true;

  // Chart data
  barChartData: any;
  barChartOptions: any;
  pieChartData: any;
  pieChartOptions: any;

  constructor(private loanService: LoanService, private router: Router) {}

  ngOnInit(): void {
    this.loanService.getTotalBorrowed().subscribe({
      next: (response: ApiResponseWrapper<number>) => {
        this.totalBorrowed = response.data || 0;
        this.loading = false;
      },
      error: (error) => console.error('Error fetching total borrowed:', error)
    });
    this.loanService.getTotalOutstanding().subscribe({
      next: (response: ApiResponseWrapper<number>) => {
        this.totalOutstanding = response.data || 0;
        this.loading = false;
      },
      error: (error) => console.error('Error fetching total outstanding:', error)
    });

    // Sample data, replace with real API data later
    this.barChartData = {
      labels: ['Đã giải ngân', 'Đã thu hồi', 'Tiền lãi'],
      datasets: [
        {
          label: 'Số tiền (VNĐ)',
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          data: [100000000, 70000000, 5000000]
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
          data: [100000000, 70000000, 5000000],
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
  }

  navigateToCreateLoan() {
    this.router.navigate(['/loans/create']);
  }

  navigateToLoanOverview() {
    this.router.navigate(['/loans/overview']);
  }

  navigateToLoanHistory() {
    this.router.navigate(['/loans/history']);
  }

  navigateToCurrentRepayments() {
    this.router.navigate(['/loans/current']);
  }
}