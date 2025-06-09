import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MY_DATE_FORMATS } from '../../shared/date-formats';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [
    NgIf,
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
  kycForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.authService
      .isKycVerified()
      .pipe(take(1))
      .subscribe((isVerified) => {
        if (isVerified) {
          this.router.navigate(['/dashboard']);
        }
      });

    this.route.queryParams.subscribe((params) => {
      this.message = params['message'] || null;
    });

    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.kycForm.patchValue({
        customerId: userInfo.sub || '',
      });
    }
  }

  initForm(): void {
    this.kycForm = this.fb.group({
      identityNumber: ['123123123133', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      fullName: ['test frontend3', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['Nam', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.kycForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const rawDate = this.kycForm.get('dateOfBirth')?.value;
    let formattedDate: string | null = null;

    if (rawDate instanceof Date) {
      const year = rawDate.getFullYear();
      const month = ('0' + (rawDate.getMonth() + 1)).slice(-2);
      const day = ('0' + rawDate.getDate()).slice(-2);
      formattedDate = `${year}-${month}-${day}`;
    } else if (typeof rawDate === 'string') {
      formattedDate = rawDate // nếu đã định dạng từ adapter
    }

    const kycData = {
      ...this.kycForm.value,
      customerId: this.authService.getUserInfo()?.sub,
      dateOfBirth: formattedDate,
    };

    console.log('kycData:', kycData);

    this.authService.verifyKyc(kycData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Xác minh KYC thất bại. Vui lòng thử lại.';
      },
    });
  }
}
