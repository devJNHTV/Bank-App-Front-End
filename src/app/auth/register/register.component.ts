import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MustMatch } from '../must-match.validator';
import { CustomDateAdapter } from '../../shared/custom-date-adapter'; 
import { MY_DATE_FORMATS } from '../../shared/date-formats';

@Component({
  selector: 'app-register',
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
    MatNativeDateModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dateAdapter: DateAdapter<Date>,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['testfe', Validators.required],
      fullName: ['test frontend', Validators.required],
      email: ['testfe@gmail.com', [Validators.required, Validators.email]],
      phoneNumber: ['0123456666', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      identityNumber: ['123123123666', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      address: ['123 Nguyễn Văn Trỗi', Validators.required],
      dateOfBirth: [new Date(2002, 5, 22), Validators.required],
      gender: ['male', Validators.required],
      password: [
        '290801Bin@',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)
        ]
      ],
      confirmPassword: ['290801Bin@', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const formValues = this.registerForm.value;
      const rawDate = formValues.dateOfBirth;

      let formattedDate: string;
      if (rawDate instanceof Date) {
        formattedDate = this.dateAdapter.format(rawDate, { dateInput: 'YYYY-MM-DD' });
      } else if (typeof rawDate === 'string') {
        formattedDate = rawDate;
      } else {
        this.isLoading = false;
        this.errorMessage = 'Ngày sinh không hợp lệ';
        return;
      }

      const userData = {
        ...formValues,
        dateOfBirth: formattedDate,
      };

      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/verify-otp']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        },
      });
    }
  }

}