import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-transaction-home',
  standalone: true,
  imports: [CardModule, RouterModule,ButtonModule],
  templateUrl: './transaction-home.component.html',
  styleUrls: ['./transaction-home.component.scss'],
})
export class TransactionHomeComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([`/transactions/${path}`]);
  }
}
