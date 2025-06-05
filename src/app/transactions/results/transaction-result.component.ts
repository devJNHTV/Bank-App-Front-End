import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-transaction-result',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    CommonModule,
  ],
  templateUrl: './transaction-result.component.html',
  styleUrls: ['./transaction-result.component.scss']
})
export class TransactionResultComponent implements OnInit {
  success: boolean = false;
  transactionData: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.success = params['success'] === 'true';
      this.transactionData = {
        fromAccount: params['fromAccount'],
        toAccount: params['toAccount'],
        amount: params['amount'],
        description: params['description'],
        timestamp: params['timestamp'],
        message: params['message']
      };
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
