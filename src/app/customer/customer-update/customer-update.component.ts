import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { MY_DATE_FORMATS } from '../../shared/date-formats';

@Component({
  selector: 'app-customer-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
    providers: [
      { provide: DateAdapter, useClass: CustomDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    ],
  templateUrl: './customer-update.component.html',
  styleUrls: ['./customer-update.component.scss']
})
export class CustomerUpdateDialogComponent {
  customerForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<CustomerUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.customerForm = this.formBuilder.group({
      fullName: [this.data.fullName || '', Validators.required],
      email: [this.data.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.data.phoneNumber || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: [this.data.address || '', Validators.required],
      dateOfBirth: [this.data.dateOfBirth ? new Date(this.data.dateOfBirth) : '', Validators.required],
      gender: [this.data.gender || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.isLoading = true;

      const rawDate = this.customerForm.get('dateOfBirth')?.value;
      let formattedDate: string | null = null;

      if (rawDate instanceof Date) {
        const year = rawDate.getFullYear();
        const month = ('0' + (rawDate.getMonth() + 1)).slice(-2);
        const day = ('0' + rawDate.getDate()).slice(-2);
        formattedDate = `${year}-${month}-${day}`;
      } else if (typeof rawDate === 'string') {
        formattedDate = rawDate
      }

      const updateData = {
        ...this.customerForm.value,
        dateOfBirth: formattedDate,
      };

      console.log('kycData:', updateData);

      this.authService.updateCustomer(updateData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Thông tin khách hàng đã được cập nhật thành công',
            timer: 1500,
          }).then(() => {
            this.dialogRef.close(updateData);
            window.location.reload();
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể cập nhật thông tin khách hàng'
          });
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      Object.keys(this.customerForm.controls).forEach(key => {
        const control = this.customerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
