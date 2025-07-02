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
import { KycRequest } from '../../core/models/KycRequest';

@Component({
  selector: 'app-kyc-manager',
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
  templateUrl: './kyc-manager.component.html',
  styleUrl: './kyc-manager.component.scss'
})
export class KycManagerComponent implements OnInit {
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  keyword: string = '';
  kycRequests: KycRequest[] = [];
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadKycRequests();
  }

  loadKycRequests(event?: any): void {
    this.isLoading = true;
    let page = this.pageIndex;
    let size = this.pageSize;
    let keyword = this.keyword
    if (event) {
      page = Math.floor(event.first / event.rows);
      size = event.rows;
    }
    this.adminService.getPendingKycRequests(page, size, keyword).subscribe({
      next: (response) => {
        this.kycRequests = response.data.kycRequests.map((kyc: any) => {
          // Parse chuỗi JSON trong details
          const details = JSON.parse(kyc.details);
          return {
            cifCode: details.cifCode,
            fullName: details.fullName,
            identityNumber: details.identityNumber,
            submittedAt: details.submitted_at,
            status: kyc.status
          };
        });
        this.totalElements = response.data.totalElements;
        this.pageSize = response.data.pageSize || this.pageSize;
        this.pageIndex = response.data.currentPage;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể tải danh sách yêu cầu KYC'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = Math.floor(event.first / event.rows);
    this.pageSize = event.rows;
    this.loadKycRequests(event);
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadKycRequests();
  }

  approveKyc(cifCode: string, status: string): void {
    this.adminService.approveKyc(cifCode, status, null).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response.message || 'Duyệt KYC thành công',
          life: 1500
        });
        this.loadKycRequests();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể duyệt KYC'
        });
      }
    });
  }

  async rejectKyc(cifCode: string): Promise<void> {
    const { value: reason } = await Swal.fire({
      title: 'Từ chối KYC',
      input: 'textarea',
      inputLabel: 'Lý do từ chối',
      inputPlaceholder: 'Nhập lý do từ chối...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập lý do từ chối';
        }
        return null;
      }
    });

    if (reason) {
      this.adminService.approveKyc(cifCode, 'REJECTED', reason).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: response.message || 'Từ chối KYC thành công',
            life: 1500
          });
          this.loadKycRequests();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể từ chối KYC'
          });
        }
      });
    }
  }
}
