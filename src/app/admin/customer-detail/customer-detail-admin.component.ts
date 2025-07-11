import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
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
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { CustomerUpdateDialogComponent } from '../../customer/customer-update/customer-update.component';

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
  customer: any;
  isLoading = false;

  constructor(
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
      next: (customer) => {
        this.customer = customer.data;
        console.log("customer detail by cifcode: ", this.customer)
        if (customer.dateOfBirth) {
          this.customer.dateOfBirth = new Date(customer.dateOfBirth);
        }
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
        window.location.reload();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}