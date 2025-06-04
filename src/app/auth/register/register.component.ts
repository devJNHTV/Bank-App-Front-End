import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MustMatch } from '../must-match.validator';

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
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['testfrontend', Validators.required],
      fullName: ['test frontend', Validators.required],
      email: ['testfrontend@gmail.com', [Validators.required, Validators.email]],
      phoneNumber: ['0123456123', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      identityNumber: ['123123123123', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      address: ['123 Nguyễn Văn Trỗi', Validators.required],
      dateOfBirth: ['02-22-2002', Validators.required],
      gender: ['male', Validators.required],
      password: ['290801Bin@', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['290801Bin@', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const userData = this.registerForm.value;
      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/verify-otp']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        }
      });
    }
  }
}