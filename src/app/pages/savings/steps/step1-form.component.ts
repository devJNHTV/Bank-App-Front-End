import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { Account, Term } from '../../../interfaces/account.interface';

@Component({
  selector: 'app-step1-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule
  ],
  templateUrl: './step1-form.component.html',
  styleUrl: './step1-form.component.scss'
})
export class Step1FormComponent implements OnInit {
  @Input() accounts: Account[] = [];
  @Input() terms: Term[] = [];
  @Output() formSubmit = new EventEmitter<any>();

  savingsForm: FormGroup;
  selectedAccount: Account | null = null;
  interestTypes: any[] = [{label: 'Lãi trả vào tài khoản tiền gửi khi đến hạn trả lãi', value: 'AT_MATURITY'}, {label: 'Lãi trả vào tài khoản tiền gửi hàng tháng', value: 'MONTHLY'}];
  constructor(private fb: FormBuilder) {
    this.savingsForm = this.fb.group({
      accountNumberSource: ['', Validators.required],
      initialDeposit: ['', [Validators.required, Validators.min(1000000), this.balanceValidator.bind(this)]],
      term: ['', Validators.required],
      interestPaymentType: ['', Validators.required],
      renewOption: [false],
      termsAgreement: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Subscribe to form changes to update selected account
    this.savingsForm.get('accountNumberSource')?.valueChanges.subscribe(accountNumber => {
      this.selectedAccount = this.accounts.find(account => account.accountNumber === accountNumber) || null;
      // Re-validate deposit amount when account changes
      this.savingsForm.get('initialDeposit')?.updateValueAndValidity();
    });
  }

  // Getter for form controls
  get initialDeposit() {
    return this.savingsForm.get('initialDeposit');
  }

  get termsAgreement() {
    return this.savingsForm.get('termsAgreement');
  }

  get interestPaymentType() {
    return this.savingsForm.get('interestPaymentType');
  }

  get renewOption() {
    return this.savingsForm.get('renewOption');
  }

  // Format currency method
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Format term label method  
  formatTermLabel(term: Term): string {
    const interest = (term.interestRate * 100).toFixed(1); 
    return `${term.termValueMonths} tháng (${interest}%/năm)`;
  }

  // Submit method
  onSubmit(): void {
    console.log('Form valid:', this.savingsForm.valid);
    console.log('Form value:', this.savingsForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    if (this.savingsForm.valid) {
      const formData = {
        ...this.savingsForm.value,
        renewOption: this.savingsForm.value.renewOption ? 'AUTO_RENEW' : 'NO_RENEW'
      };
      this.formSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.savingsForm.controls).forEach(key => {
        this.savingsForm.get(key)?.markAsTouched();
      });
    }
  }

  // Debug method to check form errors
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.savingsForm.controls).forEach(key => {
      const control = this.savingsForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Custom validator for checking balance
  balanceValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.selectedAccount) {
      return null;
    }
    
    if (control.value > this.selectedAccount.balance) {
      return { insufficientBalance: true };
    }
    
    return null;
  }
} 