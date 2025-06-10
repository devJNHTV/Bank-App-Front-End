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
import { AuthService } from '../../core/services/auth.service';

interface CustomerData {
  customerId: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
}

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
  displayedColumns: string[] = [
    'customerId',
    'fullName',
    'email',
    'phone',
    'status',
    'actions'
  ];
  dataSource!: MatTableDataSource<CustomerData>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<CustomerData>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<CustomerData>();
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.authService.getCustomerList().subscribe({
      next: (customers) => {
        this.dataSource.data = customers;
        if (this.table) {
          this.table.renderRows();
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load customers'
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

  viewCustomerDetail(customerId: number): void {
    this.router.navigate(['/admin/customers/detail'], { queryParams: { customerId } });
  }

  async updateCustomerStatus(customerId: number, currentStatus: string): Promise<void> {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Customer Status',
      input: 'select',
      inputOptions: {
        'ACTIVE': 'Active',
        'INACTIVE': 'Inactive',
        'BLOCKED': 'Blocked'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status';
        }
        return null;
      }
    });

    if (newStatus) {
      this.authService.updateCustomerStatus(newStatus).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer status updated successfully',
            timer: 1500
          });
          this.loadCustomers();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to update customer status'
          });
        }
      });
    }
  }
}