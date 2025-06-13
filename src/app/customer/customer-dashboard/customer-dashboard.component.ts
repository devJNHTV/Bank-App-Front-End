// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../../core/services/user.service';

interface Account {
  type: string;
  number: string;
  balance: string;
  currency: string;
}

interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
}

interface Beneficiary {
  name: string;
  bank: string;
  accountNumber: string;
  avatar: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    RouterModule,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent {
  username: string | null = null;

  accounts: Account[] = [
    {
      type: 'TÀI KHOẢN THANH TOÁN',
      number: '0866815181',
      balance: 'XX,XXX,XXX',
      currency: 'VND'
    },
    {
      type: 'TÀI KHOẢN THANH TOÁN',
      number: '101102290801',
      balance: 'XX,XXX,XXX',
      currency: 'VND'
    }
  ];

  beneficiaries: Beneficiary[] = [
    {
      name: 'Nguyễn Văn A',
      bank: 'KienlongBank',
      accountNumber: '123456789',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMyMmM1NWUiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkM5Ljc5IDEyIDggMTAuMjEgOCA4UzkuNzkgNCA0IDhTMTIgOS43OSAxMiAxMlpNMTIgMTRDMTQuNjcgMTQgMjAgMTUuMzQgMjAgMThWMjBIMTRWMThDMTQgMTUuMzQgOS4zMyAxNCAxMiAxNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K'
    }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    this.loadUsername();
  }

  loadUsername() {
    this.username = this.userService.getUsername();
  }

  logout(): void {
    this.authService.logout();
  }
}
