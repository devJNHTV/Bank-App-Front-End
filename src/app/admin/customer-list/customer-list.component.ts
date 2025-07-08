import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../../core/services/admin.service';
import { CustomerResponse } from '../../core/models/customer-response.dto';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    PaginatorModule,
    ChipModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  keyword: string = '';
  customers: CustomerResponse[] = [];
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(event?: any): void {
    this.isLoading = true;
    let page = this.pageIndex;
    let size = this.pageSize;
    if (event) {
      page = Math.floor(event.first / event.rows);
      size = event.rows;
    }
    this.adminService.getCustomerList(page, size, this.keyword).subscribe({
      next: (response) => {
        this.customers = response.data.customers;
        this.totalElements = response.data.totalElements;
        this.pageSize = response.data.pageSize || this.pageSize;
        this.pageIndex = response.data.currentPage;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể tải danh sách khách hàng'
        });
        this.router.navigate(['/dashboard']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = Math.floor(event.first / event.rows);
    this.pageSize = event.rows;
    this.loadCustomers(event);
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadCustomers();
  }

  viewCustomerDetail(cifCode: string): void {
    this.router.navigate(['customers/detail', cifCode]);
  }

  async updateCustomerStatus(cifCode: string, currentStatus: string): Promise<void> {
    const { value: newStatus } = await Swal.fire({
      title: 'Cập nhật trạng thái khách hàng',
      input: 'select',
      inputOptions: {
        ACTIVE: 'Kích hoạt',
        SUSPENDED: 'Tạm khóa',
        CLOSED: 'Khóa'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng chọn trạng thái';
        }
        return null;
      }
    });

    if (newStatus) {
      this.adminService.updateCustomerStatus(cifCode, newStatus).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cập nhật trạng thái khách hàng thành công',
            life: 1500
          });
          this.loadCustomers();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể cập nhật trạng thái khách hàng'
          });
        }
      });
    }
  }
}