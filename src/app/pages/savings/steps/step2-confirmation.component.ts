import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Account, Term } from '../../../interfaces/account.interface';

@Component({
  selector: 'app-step2-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './step2-confirmation.component.html',
  styleUrl: './step2-confirmation.component.scss'
})
export class Step2ConfirmationComponent {
  @Input() formData: any;
  @Input() accounts: Account[] = [];
  @Input() terms: Term[] = [];
  @Output() confirmSubmit = new EventEmitter<void>();
  @Output() backToPrevious = new EventEmitter<void>();

  get selectedAccount(): Account | undefined {
    return this.accounts.find(account => account.accountNumber === this.formData?.accountNumberSource);
  }

  get selectedTerm(): Term | undefined {
    return this.terms.find(term => term.termValueMonths === this.formData?.term);
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

  onConfirm(): void {
    this.confirmSubmit.emit();
  }

  onBack(): void {
    this.backToPrevious.emit();
  }

  getMaturityDate(): string {
    const currentDate = new Date();
    const maturityDate = new Date(currentDate);
    maturityDate.setMonth(currentDate.getMonth() + (this.selectedTerm?.termValueMonths || 0));
    
    return maturityDate.toLocaleDateString('vi-VN');
  }

  getExpectedInterest(): number {
    if (!this.formData?.initialDeposit || !this.selectedTerm?.interestRate) {
      return 0;
    }
    
    const principal = this.formData.initialDeposit;
    const rate = this.selectedTerm.interestRate;
    const timeInYears = (this.selectedTerm.termValueMonths || 0) / 12;
    
    return principal * rate * timeInYears;
  }

  getTotalAmount(): number {
    return (this.formData?.initialDeposit || 0) + this.getExpectedInterest();
  }

  getInterestRateDisplay(): string {
    if (!this.selectedTerm?.interestRate) {
      return '0';
    }
    return (this.selectedTerm.interestRate * 100).toFixed(1);
  }
} 