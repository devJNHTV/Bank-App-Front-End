import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { KycStatisticsResponse } from '../../core/models/KycStatisticsResponse';
import { CustomerGrowthResponse } from '../../core/models/CustomerGrowthResponse';
import { KycService } from '../../core/services/kyc.service';
import { ToastModule } from 'primeng/toast';
import { ApiResponse } from '../../core/models/ApiResponse';
import { AccountStatisticComponent } from '../account-statistic/account-statistic.component';
  
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SidebarModule,
    MenuModule,
    ChartModule,
    ProgressBarModule,
    TagModule,
    ToastModule,
    AccountStatisticComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  kycStats: KycStatisticsResponse | null = null;
  customerGrowth: CustomerGrowthResponse | null = null;
  startDate: string = '';
  endDate: string = '';

  lineChartData: any = {
  labels: ['30 ngày trước', 'Hiện tại'],
  datasets: [
    {
      label: 'Số lượng khách hàng', // Thêm nhãn cho dataset
      data: [70, 0], // Dữ liệu ban đầu (sẽ được cập nhật trong loadCustomerGrowth)
      borderColor: '#ffffff',
      backgroundColor: 'transparent',
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ffffff',
      pointRadius: 5
    }
  ]
};

  lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true } },
  scales: {
    x: {
      display: true,
      title: { display: true, text: 'Thời gian' }
    },
    y: {
      display: true,
      title: { display: true, text: 'Số lượng khách hàng' }, // Cập nhật tiêu đề
      beginAtZero: true,
      suggestedMax: 100 // Đặt giới hạn tối đa để trục y dễ nhìn
    }
  },
  elements: {
    line: { tension: 0.4 }, // Đảm bảo đường được vẽ
    point: { hoverRadius: 8 }
  }
};

  doughnutChartData: any = {
    labels: ['Thành công', 'Thất bại', 'Đang chờ'],
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
    plugins: { legend: { display: true } } // Bật legend
  };

  constructor(
    private kycService: KycService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const today = new Date(); // 02/07/2025, 03:49 PM +07
    this.endDate = today.toISOString().split('T')[0]; // 2025-07-02
    this.startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0]; // 2025-06-02
    this.loadKycStatistics();
    this.loadCustomerGrowth();
  }

  loadKycStatistics() {
  if (!this.startDate || !this.endDate) {
    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn cả Từ ngày và Đến ngày' });
    return;
  }
  this.kycService.getKycStatistics(this.startDate, this.endDate).subscribe({
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
      this.cdr.detectChanges(); // Kích hoạt phát hiện thay đổi
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
  this.kycService.getCustomerGrowth(this.startDate, this.endDate).subscribe({
    next: (growth: ApiResponse<CustomerGrowthResponse>) => {
      this.customerGrowth = growth.data;
      this.lineChartData = {
        labels: ['30 ngày trước', 'Hiện tại'],
        datasets: [{
          label: 'Số lượng khách hàng',
          data: [
            growth.data.previousPeriodCustomers,
            growth.data.totalNewCustomers
          ],
          borderColor: '#ffffff', // Đảm bảo màu đường
          backgroundColor: 'transparent',
          borderWidth: 3, // Độ dày đường
          fill: false, // Không tô kín khu vực
          tension: 0.4, // Độ cong của đường
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ffffff',
          pointRadius: 5
        }]
      };
      this.cdr.detectChanges();
      console.log('Customer Growth:', growth);
    },
    error: (err) => {
      console.error('Lỗi khi tải tăng trưởng khách hàng:', err);
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải tăng trưởng khách hàng' });
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