import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { KycStatisticsResponse } from '../../core/models/KycStatisticsResponse';
import { CustomerGrowthResponse } from '../../core/models/CustomerGrowthResponse';
import { KycService } from '../../core/services/kyc.service';
import { ApiResponse } from '../../core/models/ApiResponse';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ChartModule,
    ProgressBarModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './dashboard-customer.component.html',
  styleUrls: ['./dashboard-customer.component.scss']
})
export class DashboardCustomerComponent implements OnInit {
  kycStats: KycStatisticsResponse | null = null;
  customerGrowth: CustomerGrowthResponse | null = null;
  startDate: string = '';
  endDate: string = '';

  lineChartData: any = {
    labels: ['', ''],
    datasets: [
      {
        label: 'Số lượng khách hàng',
        borderColor: '#4f46e5',
        backgroundColor: 'transparent',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#4f46e5',
        pointRadius: 5
      }
    ]
  };

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { display: true, title: { display: true, text: 'Thời gian' } },
      y: { display: true, title: { display: true, text: 'Số lượng khách hàng' }, beginAtZero: true, suggestedMax: 100 }
    },
    elements: { line: { tension: 0.4 }, point: { hoverRadius: 8 } }
  };

  doughnutChartData: any = {
    labels: ['Thành công', 'Thất bại', 'Yêu cầu KYC'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#1dd1a1', '#ff4757', '#5352ed'],
        borderWidth: 0,
        cutout: '70%'
      }
    ]
  };

  doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    this.loadKycStatistics();
    this.loadCustomerGrowth();
  }

  loadKycStatistics() {
    if (!this.startDate || !this.endDate) {
      this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn cả Từ ngày và Đến ngày' });
      return;
    }
    this.adminService.getKycStatistics(this.startDate, this.endDate).subscribe({
      next: (res: ApiResponse<KycStatisticsResponse>) => {
        this.kycStats = res.data;
        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{
            ...this.doughnutChartData.datasets[0],
            data: [
              res.data.successfulKyc,
              res.data.failedKyc,
              res.data.pendingKyc
            ]
          }]
        };
        this.cdr.detectChanges();
        console.log('Loaded KYC Stats:', this.kycStats);
      },
      error: (err) => {
        console.error('Lỗi khi tải thống kê KYC:', err);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thống kê KYC' });
      }
    });
  }

  loadCustomerGrowth() {
    if (!this.startDate || !this.endDate) {
      this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn cả Từ ngày và Đến ngày' });
      return;
    }
    this.adminService.getCustomerGrowth(this.startDate, this.endDate).subscribe({
      next: (growth: ApiResponse<CustomerGrowthResponse>) => {
        if (!growth.data || (growth.data.totalNewCustomers === 0 && growth.data.previousPeriodCustomers === 0)) {
          this.customerGrowth = null;
          this.lineChartData = {
            labels: ['', ''],
            datasets: [
              {
                label: 'Số lượng khách hàng',
                data: [0, 0],
                borderColor: '#4f46e5',
                backgroundColor: 'transparent',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#4f46e5',
                pointRadius: 5
              }
            ]
          };
          this.messageService.add({ severity: 'info', summary: 'Thông báo', detail: 'Không có dữ liệu tăng trưởng khách hàng trong khoảng thời gian này.' });
        } else {
          this.customerGrowth = growth.data;
          this.lineChartData = {
            labels: ['', ''],
            datasets: [{
              label: 'Số lượng khách hàng',
              data: [
                growth.data.previousPeriodCustomers,
                growth.data.previousPeriodCustomers + growth.data.totalNewCustomers
              ],
              borderColor: '#4f46e5',
              backgroundColor: 'transparent',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              pointBackgroundColor: '#4f46e5',
              pointBorderColor: '#4f46e5',
              pointRadius: 5
            }]
          };
        }
        this.cdr.detectChanges();
        console.log('Customer Growth:', growth);
      },
      error: (err) => {
        this.customerGrowth = null;
        this.lineChartData = {
          labels: ['', ''],
          datasets: [
            {
              label: 'Số lượng khách hàng',
              data: [0, 0],
              borderColor: '#4f46e5',
              backgroundColor: 'transparent',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              pointBackgroundColor: '#4f46e5',
              pointBorderColor: '#4f46e5',
              pointRadius: 5
            }
          ]
        };
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải tăng trưởng khách hàng' });
        console.error('Lỗi khi tải tăng trưởng khách hàng:', err);
      }
    });
  }

  onDateChange() {
    if (this.startDate && this.endDate) {
      this.loadKycStatistics();
      this.loadCustomerGrowth();
    }
  }
}