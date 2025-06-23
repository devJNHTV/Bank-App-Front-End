import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { GalleriaModule } from 'primeng/galleria';
import { MenuItem } from 'primeng/api';
import { creditCards } from '../../../../interfaces/account.interface';
import { AccountService } from '../../../../services/account/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-credit',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    GalleriaModule
  ],
  templateUrl: './register-credit.component.html',
  styleUrl: './register-credit.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RegisterCreditComponent implements OnInit {
  creditCards: creditCards[] = [];  
  constructor(private accountService: AccountService, private router: Router) { }
  ngOnInit(): void {
    this.loadCreditCards();
  }
  loadCreditCards(): void {
    this.accountService.getCreditCards().subscribe((res :any) => {
      console.log('Credit cards response:', res);
      this.creditCards = res.data;
      console.log('Credit cards loaded:', this.creditCards);
    }, error => {
      console.error('Error loading credit cards:', error);
      // Fallback data for testing
      this.creditCards = [
        {
          cardID: '1',
          typeName: 'Thẻ Tín Dụng Platinum',
          defaultCreditLimit: 50000000,
          interestRate: 1.5,
          annualFee: 500000,
          minimumIncome: 15000000,
          imgURL: 'credit-card-1.jpg'
        },
        {
          cardID: '2',
          typeName: 'Thẻ Tín Dụng Gold',
          defaultCreditLimit: 20000000,
          interestRate: 1.8,
          annualFee: 300000,
          minimumIncome: 8000000,
          imgURL: 'credit-card-2.jpg'
        }
      ];
    });
  }

  banners = [
    { image: 'assets/img/banner1.jpg', alt: 'Banner 1' },
    { image: 'assets/img/banner2.png', alt: 'Banner 2' },
    { image: 'assets/img/banner3.jpg', alt: 'Banner 3' },
    { image: 'assets/img/banner4.jpg', alt: 'Banner 4' }
  ];
  benefits = [
    'Miễn phí thường niên năm đầu',
    'Hoàn tiền lên đến 3% cho mọi giao dịch',
    'Tích điểm không giới hạn',
    'Bảo hiểm du lịch quốc tế',
    'Dịch vụ concierge 24/7'
  ];

  registerCard(cardType: string): void {
    console.log(`Registering card: ${cardType}`);
    // Implement registration logic here
  }

  // Method to show card details
  showCardDetails(cardType: string): void {
    console.log(`Showing details for card: ${cardType}`);
    // Implement show details logic here
  }
  openRegisterCredit(cardID: string): void {
    console.log(`Opening register credit for card: ${cardID}`);
    this.router.navigate(['/account/credit/register/apply-credit', cardID]);
    // Implement register credit logic here
  }
} 
