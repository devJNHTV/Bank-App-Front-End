import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-transaction-result',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    CommonModule,
    ToastModule 
  ],
  templateUrl: './transaction-result.component.html',
  styleUrls: ['./transaction-result.component.scss'],
  providers: [MessageService]
})
export class TransactionResultComponent  {
    success: boolean = false;
  transactionData: any = {};
  fromCustomerName: string | null = null;
  toCustomerName: string | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService
  ) {
    const state = this.location.getState() as {
      success: boolean;
      transactionData: any;
      fromCustomerName: string | null;
      toCustomerName: string | null;
    };
    this.success = state?.success ?? false;
    this.transactionData = state?.transactionData ?? {};
    this.fromCustomerName = state?.fromCustomerName ?? null;
    this.toCustomerName = state?.toCustomerName ?? null;
    console.log('➡️ Dữ liệu từ router state:', this.transactionData);
  }

  goHome() {
    this.router.navigate(['/']);
  }
   
}
