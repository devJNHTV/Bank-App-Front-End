import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RepaymentService } from '../../services/repayment.service';
import { AccountService } from '../../services/account/account.service';
import { Repayment } from '../../models/repayment.model';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { Account } from '../../interfaces/account.interface';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-pay-repayment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './pay-repayment.component.html',
  styleUrls: ['./pay-repayment.component.scss']
})
export class PayRepaymentComponent implements OnInit {
  repayment: Repayment | null = null;
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;
  showOtpDialog = false;
  referenceCode: string | null = null;

  paymentForm: FormGroup;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private repaymentService: RepaymentService,
    private accountService: AccountService,
    private messageService: MessageService
  ) {
    this.paymentForm = this.fb.group({
      accountNumber: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]]
    });

    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    const repaymentId = this.route.snapshot.paramMap.get('id');
    if (repaymentId) {
      this.loadRepayment(+repaymentId);
      this.loadAccounts();
    }
  }

  loadRepayment(repaymentId: number): void {
    this.loading = true;
    this.error = null;

    this.repaymentService.getRepaymentById(repaymentId).subscribe({
      next: (response: ApiResponseWrapper<Repayment>) => {
        if (response.status === 200) {
          this.repayment = response.data;
          // Set max amount for payment
          const maxAmount = this.repayment.principal + this.repayment.interest - this.repayment.paidAmount;
          this.paymentForm.get('amount')?.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(maxAmount)
          ]);
          this.paymentForm.get('amount')?.updateValueAndValidity();
        } else {
          this.error = response.message || 'Failed to load repayment details';
          this.showNotification('error', 'Error', this.error);
        }
      },
      error: (err) => {
        this.error = 'Error loading repayment details';
        this.showNotification('error', 'Error', this.error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
        next: (res: any) => {
            this.accounts = res.data;
            console.log(this.accounts);
            
          },
      error: (err) => {
        this.showNotification('error', 'Error', 'Error loading accounts');
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const repaymentId = this.route.snapshot.paramMap.get('id');
    if (!repaymentId || !this.repayment) return;

    this.loading = true;
    this.repaymentService.makeRepayment(+repaymentId, this.paymentForm.value.amount).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.referenceCode = response.data;
          this.showOtpDialog = true;
          this.showNotification('success', 'Success', 'OTP has been sent to your email');
        } else {
          this.showNotification('error', 'Error', response.message || 'Failed to process payment');
        }
      },
      error: (err) => {
        this.showNotification('error', 'Error', 'Error processing payment');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  confirmPayment(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const repaymentId = this.route.snapshot.paramMap.get('id');
    if (!repaymentId || !this.repayment || !this.referenceCode) return;

    this.loading = true;
    this.repaymentService.confirmRepayment(
      +repaymentId,
      this.paymentForm.value.amount,
      this.otpForm.value.otpCode,
      this.referenceCode
    ).subscribe({
      next: (response: ApiResponseWrapper<Repayment>) => {
        if (response.status === 200) {
          this.showNotification('success', 'Success', 'Payment confirmed successfully');
          this.router.navigate(['/loan/current']);
        } else {
          this.showNotification('error', 'Error', response.message || 'Failed to confirm payment');
        }
      },
      error: (err) => {
        this.showNotification('error', 'Error', 'Error confirming payment');
      },
      complete: () => {
        this.loading = false;
        this.showOtpDialog = false;
      }
    });
  }

  calculateTotalAmount(): number {
    if (!this.repayment) return 0;
    return this.repayment.principal + this.repayment.interest;
  }

  calculateRemainingAmount(): number {
    if (!this.repayment) return 0;
    return this.calculateTotalAmount() - this.repayment.paidAmount;
  }

  private showNotification(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail
    });
  }
} 