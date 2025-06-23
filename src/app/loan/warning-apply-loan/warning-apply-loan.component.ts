import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warning-apply-loan',
  templateUrl: './warning-apply-loan.component.html',
  styleUrls: ['./warning-apply-loan.component.scss']
})
export class WarningApplyLoanComponent {
  loading = false;
  
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/loans']);
  }

  goToLoanManagement() {
    this.router.navigate(['/loans/overview']);
  }
} 