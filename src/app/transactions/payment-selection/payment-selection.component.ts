import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-payment-selection',
  standalone: true,
  imports: [CardModule, RouterModule, ButtonModule],
  templateUrl: './payment-selection.component.html',
  styleUrls: ['./payment-selection.component.scss'],
})
export class PaymentSelectionComponent {
  constructor(private router: Router) {}
    
  navigateTo(path: string) {
    this.router.navigate([`/transactions/payment/${path}`]);
  }
  goBack() {
    this.router.navigate(['/transactions']);
  }
}
