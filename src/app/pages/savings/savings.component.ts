import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { StepperComponent } from '../../components/stepper/stepper.component';

interface Account {
  name: string;
  balance: number;
  value: string;
}

interface Term {
  name: string;
  value: string;
  months: number;
  rate: number;
}

interface PaymentMethod {
  name: string;
  value: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule,
    CheckboxModule,
    StepperComponent
  ],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.scss'
})
export class SavingsComponent {
  counter = 0;
  id: number = 0;
  accountData: any;
  
  // Savings form properties
  savingsForm: FormGroup;
  currentStep: number = 1;
  
  accounts: Account[] = [
    { name: '0123456789 - Tài khoản thanh toán', balance: 50000000, value: '0123456789' },
    { name: '0987654321 - Tài khoản thanh toán 2', balance: 100000000, value: '0987654321' }
  ];
  
  terms: Term[] = [
    { name: '1 tháng - 4.5%/năm', value: '1', months: 1, rate: 4.5 },
    { name: '3 tháng - 5.0%/năm', value: '3', months: 3, rate: 5.0 },
    { name: '6 tháng - 5.5%/năm', value: '6', months: 6, rate: 5.5 },
    { name: '12 tháng - 6.0%/năm', value: '12', months: 12, rate: 6.0 },
    { name: '24 tháng - 6.5%/năm', value: '24', months: 24, rate: 6.5 }
  ];
  
  paymentMethods: PaymentMethod[] = [
    { name: 'Trả lãi cuối kỳ', value: 'end' },
    { name: 'Trả lãi định kỳ hàng tháng', value: 'monthly' },
    { name: 'Tái tục gốc và lãi', value: 'compound' }
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.savingsForm = this.fb.group({
      accountSrc: ['', Validators.required],
      interate: [this.terms[0].rate, Validators.required],
      amount: [1000000, [Validators.required, Validators.min(1000000)]],
      paymentMethod: [this.paymentMethods[0], Validators.required],
      term: [this.terms[0].months, Validators.required],
      termsAgreement: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
  }

  // Getter for form controls
  get amount() {
    return this.savingsForm.get('amount');
  }

  get termsAgreement() {
    return this.savingsForm.get('termsAgreement');
  }

  // Format currency method
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Submit method
  onSubmit(): void {
    if (this.savingsForm.valid) {
      console.log('Form submitted:', this.savingsForm.value);
      this.currentStep = this.currentStep + 1; // Move to next step
      // Here you would typically call a service to submit the form
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.savingsForm.controls).forEach(key => {
        this.savingsForm.get(key)?.markAsTouched();
      });
    }
  }
}

