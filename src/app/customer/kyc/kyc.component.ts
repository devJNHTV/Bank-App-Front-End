import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { MY_DATE_FORMATS } from '../../shared/date-formats';
import Swal from 'sweetalert2';
import { KycService } from '../../core/services/kyc.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
  ],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss',
})
export class KycComponent implements OnInit {
  kycForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private kycService: KycService,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<any>
  ) {
    this.kycForm = this.fb.group({
      identityNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.kycService.checkKycStatus().subscribe({
      next: (res) => {
        if (res.verified) {
          Swal.fire({
            icon: 'info',
            title: 'Thông báo',
            text: 'Tài khoản của bạn đã được xác minh KYC!',
            timer: 3000,
          }).then(() => {
            this.router.navigate(['/customer-dashboard']);
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Thông báo',
            text: 'Vui lòng xác minh danh tính để tiếp tục!',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'info',
          title: 'Thông báo',
          text: 'Vui lòng xác minh danh tính để tiếp tục!',
          timer: 3000,
          timerProgressBar: true,
        });
      },
    });
  }

  onSubmit(): void {
    if (this.kycForm.invalid || !this.email) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin.';
      this.kycForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const rawDate = this.kycForm.get('dateOfBirth')?.value;
    let formattedDate: string | null = null;

    if (rawDate instanceof Date) {
      formattedDate = this.dateAdapter.format(rawDate, 'YYYY-MM-DD');
    } else if (typeof rawDate === 'string') {
      formattedDate = rawDate;
    } else {
      this.isLoading = false;
      this.errorMessage = 'Ngày sinh không hợp lệ';
      return;
    }

    const kycData = {
      identityNumber: this.kycForm.get('identityNumber')?.value,
      fullName: this.kycForm.get('fullName')?.value,
      dateOfBirth: formattedDate,
      gender: this.kycForm.get('gender')?.value,
    };

    this.kycService.verifyKyc(kycData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Xác minh KYC thành công, mã OTP đã được gửi!',
          timer: 3000,
        }).then(() => {
          this.router.navigate(['/confirm-otp'], { queryParams: { email: this.email } });
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Xác minh KYC thất bại. Vui lòng thử lại.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage || undefined,
          timer: 3000,
        });
      },
    });
  }
}