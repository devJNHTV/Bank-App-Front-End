import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { CustomerResponse } from '../../core/models/customer-response.dto'; 

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class CustomerListComponent implements OnInit {
  // Cập nhật displayedColumns để hiển thị tất cả các trường
  displayedColumns: string[] = [
    'cifCode',
    'fullName',
    'address',
    'email',
    'phoneNumber',
    'identityNumber',
    'dateOfBirth',
    'gender',
    'status',
    'kycStatus',
    'actions'
  ];
  dataSource!: MatTableDataSource<CustomerResponse>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<CustomerResponse>;

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<CustomerResponse>();
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    // Kiểm tra paginator có tồn tại không trước khi sử dụng
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.paginator.page.subscribe(() => {
        console.log('Page index:', this.paginator.pageIndex);
        console.log('Page size:', this.paginator.pageSize);
      });
    }
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.adminService.getCustomerList().subscribe({
      next: (response: any) => {
        this.dataSource = new MatTableDataSource<CustomerResponse>(response.data.customers);

        // Gán lại paginator & sort sau khi có dữ liệu
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.table) {
          this.table.renderRows();
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.message || 'Không thể tải danh sách khách hàng'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewCustomerDetail(cifCode: string): void {
    this.router.navigate(['customers/detail', cifCode]);
  }

  async updateCustomerStatus(cifCode: string, currentStatus: string): Promise<void> {
    const { value: newStatus } = await Swal.fire({
      title: 'Cập nhật trạng thái khách hàng',
      input: 'select',
      inputOptions: {
        ACTIVE: 'Hoạt động',
        SUSPENDED: 'Không hoạt động',
        CLOSED: 'Bị khóa'
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
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Cập nhật trạng thái khách hàng thành công',
            timer: 1500
          });
          this.loadCustomers();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật trạng thái khách hàng'
          });
        }
      });
    }
  }
}