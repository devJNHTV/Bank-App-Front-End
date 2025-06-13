import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { CustomerUpdateDialogComponent } from '../../customer/customer-update/customer-update.component';

interface Customer {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityNumber: string;
  dateOfBirth: Date | null;
  gender: 'male' | 'female';
  address: string;
  status: string;
}

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './customer-detail-admin.component.html',
  styleUrls: ['./customer-detail-admin.component.scss'],
})
export class CustomerDetailAdminComponent implements OnInit {
  cifCode: string | null = null;
  customer: Customer | null = null;
  isLoading = false;

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cifCode = this.route.snapshot.paramMap.get('cifCode');
    if (this.cifCode) {
      this.loadCustomerDetail(this.cifCode);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không tìm thấy mã CIF của khách hàng',
      }).then(() => this.goBack());
    }
  }

  loadCustomerDetail(cifCode: string): void {
    this.isLoading = true;
    this.adminService.getCustomerDetailByCifcode(cifCode).subscribe({
      next: (response) => {
        this.customer = response.data;
        if (this.customer?.dateOfBirth) {
          this.customer.dateOfBirth = new Date(this.customer.dateOfBirth);
        }
        console.log('Customer:', this.customer);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.message || 'Không thể tải thông tin khách hàng',
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  openUpdateDialog(): void {
    if (!this.customer) return;
    const dialogRef = this.dialog.open(CustomerUpdateDialogComponent, {
      width: '600px',
      data: { ...this.customer },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.cifCode) {
        this.customer = result;
        this.loadCustomerDetail(this.cifCode);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}