import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-bill-lookup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './bill-lookup.component.html',
  styleUrls: ['./bill-lookup.component.scss'],
  providers: [MessageService]
})
export class BillLookupComponent implements OnInit {
  // Form fields
  selectedProvider: any = null;
  customerCode: string = '';
  billType: string = '';
  providers: any[] = [];
  // Providers for each bill type
  searchBillRequest: any = {
    customerCode: '',
    provider: '',
    billType: ''
  };

  // Available providers based on bill type
  availableProviders: any[] = [];

  // Search result
  billResult: any = null;
  loading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private transactionService: TransactionService
  ) {}

    ngOnInit() {
      this.transactionService.getProvider().subscribe((res: any) => {
        this.providers = res.result;
        this.route.params.subscribe(params => {
          this.billType = params['type']; // Get bill type from URL path
          if (this.billType) {
            this.availableProviders = this.providers[this.billType as keyof typeof this.providers] || [];
          }
        });
      });
    
  }

  searchBill() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;  

    this.searchBillRequest.customerCode = this.customerCode;
    this.searchBillRequest.provider = this.selectedProvider.value;
    this.searchBillRequest.billType = this.billType.toUpperCase();
    this.transactionService.checkBill(this.searchBillRequest).subscribe((res: any) => {
      this.billResult = {
        billId: res.result.billId,
        customerCode: this.customerCode,
        customerName: res.result.customerName,
        amount: res.result.amount,
        status: res.result.status,
        provider: this.selectedProvider.name
      };
      console.log(this.billResult)
    });
  }

  clearForm() {
    this.selectedProvider = null;
    this.customerCode = '';
    this.billResult = null;
  }

  proceedToPayment() {
    if (!this.billResult) {
      return;
    }
    const selectedBill = {
      type: this.billType,
      provider: this.selectedProvider.value,
      customerCode: this.customerCode,
      amount: this.billResult.amount
    };
    
    // Navigate to payment page with bill information
    this.router.navigate(['/transactions/pay-bill'], {
      state: {
        bill: selectedBill
      }
    });
  }

  private validateForm(): boolean {
    if (!this.selectedProvider) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng chọn nhà cung cấp'
      });
      console.log(this.selectedProvider)
      return false;
    }

    if (!this.customerCode) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng nhập mã khách hàng'
      });
      console.log(this.customerCode)
      return false;
    }

    return true;
  }
}
