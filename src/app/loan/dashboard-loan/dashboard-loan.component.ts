// src/app/dashboard-loan/dashboard-loan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-dashboard-loan',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, PanelModule],
  templateUrl: './dashboard-loan.component.html',
  styleUrls: ['./dashboard-loan.component.scss']
})
export class DashboardLoanComponent implements OnInit {
  totalBorrowed: number = 0;
  totalOutstanding: number = 0;

  constructor(private loanService: LoanService, private router: Router) {}

  ngOnInit(): void {
    this.loanService.getCustomerId().subscribe({
      next: (response: ApiResponseWrapper<number>) => {
        console.log("set id"+response.data.toString());
        
        localStorage.setItem('idCustomer', response.data.toString());
      },
      error: (error) => console.error(error)
    });
    

    this.loanService.getTotalBorrowed().subscribe({
      next: (response: ApiResponseWrapper<number>) => {
        this.totalBorrowed = response.data || 0;
      },
      error: (error) => console.error('Error fetching total borrowed:', error)
    });

    // Lấy tổng số tiền còn nợ
    this.loanService.getTotalOutstanding().subscribe({
      next: (response: ApiResponseWrapper<number>) => {
        this.totalOutstanding = response.data || 0;
      },
      error: (error) => console.error('Error fetching total outstanding:', error)
    });
  }

  navigateToCreateLoan() {
    this.router.navigate(['/loan/create']);
  }

  navigateToLoanOverview() {
    this.router.navigate(['/loan/overview']);
  }

  navigateToLoanHistory() {
    this.router.navigate(['/loan/history']);
  }

  navigateToCurrentRepayments() {
    this.router.navigate(['loan/current']);
  }
}