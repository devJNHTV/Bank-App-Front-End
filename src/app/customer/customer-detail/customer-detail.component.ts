import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../core/services/auth.service';
import { CustomerUpdateDialogComponent } from '../customer-update/customer-update.component';
import { UserService } from '../../core/services/user.service';

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
    MatDialogModule
  ],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit {
  userId!: string;
  customer: any;
  isLoading = false;
  customerAccounts: any[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomerDetail();
    this.loadCustomerAccounts();
  }

  loadCustomerDetail(): void {
    this.isLoading = true;
    this.userService.getCustomerDetail(this.userId).subscribe({
      next: (customer) => {
        this.customer = customer.data;
        console.log(this.customer)
        if (customer.dateOfBirth) {
          this.customer.dateOfBirth = new Date(customer.dateOfBirth);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.message || 'Không thể tải thông tin khách hàng'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadCustomerAccounts(): void {
    this.userService.getCustomerAccounts().subscribe({
      next: (accounts) => {
        this.customerAccounts = accounts.data;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách tài khoản khách hàng:', error);
      }
    });
  }

  openUpdateDialog(): void {
    const dialogRef = this.dialog.open(CustomerUpdateDialogComponent, {
      width: '600px',
      data: { ...this.customer }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customer = result;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer-dashboard']);
  }
}

