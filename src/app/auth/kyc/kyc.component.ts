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
    NgIf,
  ],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
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
    // Kiểm tra nếu đã KYC thì chuyển về dashboard
    this.authService.isKycVerified()
      .pipe(take(1))
      .subscribe(isVerified => {
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
      identityNumber: ['123123123122', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      fullName: ['test frontend1', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['Nam', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.kycForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const kycData = {
      ...this.kycForm.value,
      customerId: this.authService.getUserInfo()?.sub
    };

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
