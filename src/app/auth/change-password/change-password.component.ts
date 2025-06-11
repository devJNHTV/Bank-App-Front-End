import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { MustMatch } from '../must-match.validator';
import { PasswordService } from '../../core/services/password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
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
    MatProgressSpinnerModule
  ]
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private passwordService: PasswordService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, {
      validator: MustMatch('newPassword', 'confirmNewPassword')
    });
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmNewPassword') {
    if (field === 'currentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    }
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

    this.passwordService.changePassword(currentPassword, newPassword, confirmNewPassword).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error: { message?: string }) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
