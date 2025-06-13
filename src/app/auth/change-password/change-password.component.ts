import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MustMatch } from '../must-match.validator';
import { PasswordService } from '../../core/services/password.service';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
    private passwordService: PasswordService,
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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

  get newPasswordError(): string | null {
    const control = this.changePasswordForm.get('newPassword');
    if (control?.hasError('required')) return 'Vui lòng nhập mật khẩu mới';
    if (control?.hasError('minlength')) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (control?.hasError('pattern')) return 'Mật khẩu phải có: chữ hoa, chữ thường, số và ký tự đặc biệt';
    return null;
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

  close() {
    this.dialogRef.close(true);
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
        Swal.fire({
          icon: 'success',
          title: 'Đổi mật khẩu thành công',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.dialogRef.close(true);
          window.location.reload(); // hoặc navigate nếu cần
        });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.',
          confirmButtonText: 'OK'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
