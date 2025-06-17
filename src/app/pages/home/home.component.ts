import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    CardModule, 
    ButtonModule, 
    ChartModule, 
    TableModule, 
    TagModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  
  // Sample data for banking dashboard
  accountBalance = 125750.50;
  
  recentTransactions = [
    { 
      id: '1001', 
      description: 'Online Purchase - Amazon', 
      amount: -89.99, 
      date: '2024-01-15',
      type: 'debit'
    },
    { 
      id: '1002', 
      description: 'Salary Deposit', 
      amount: 3500.00, 
      date: '2024-01-14',
      type: 'credit'
    },
    { 
      id: '1003', 
      description: 'ATM Withdrawal', 
      amount: -200.00, 
      date: '2024-01-13',
      type: 'debit'
    },
    { 
      id: '1004', 
      description: 'Transfer to Savings', 
      amount: -500.00, 
      date: '2024-01-12',
      type: 'transfer'
    }
  ];

  // Chart data for spending overview
  chartData = {
    labels: ['Dining', 'Shopping', 'Transport', 'Bills', 'Entertainment'],
    datasets: [
      {
        data: [300, 150, 100, 400, 200],
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  getTransactionSeverity(type: string) {
    switch (type) {
      case 'credit':
        return 'success';
      case 'debit':
        return 'danger';
      case 'transfer':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
