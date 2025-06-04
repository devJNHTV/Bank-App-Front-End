import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { MustMatch } from '../must-match.validator';

@Component({
  selector: 'app-forgot-password',
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
          MatProgressSpinnerModule
        ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  currentForm: string = 'forgotPassword';
  registerForm: FormGroup;
  forgotPasswordForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  switchForm(form: string) {
    this.currentForm = form;
    this.isLoading = false;
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      // Implement forgot password logic
      console.log('Forgot password form submitted', this.forgotPasswordForm.value);
      setTimeout(() => {
        this.isLoading = false;
        this.switchForm('verifyOtp');
      }, 1000);
    }
  }

}
