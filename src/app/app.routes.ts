import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { AboutComponent } from './pages/about/about.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AccountComponent } from './pages/account/account.component';
import { PaymentComponent } from './pages/account/payment/payment.component';
import { CreditComponent } from './pages/account/credit/credit.component';
import { DetailComponent } from './pages/account/payment/detail/detail.component';
import { RegisterCreditComponent } from './pages/account/credit/register-credit/register-credit.component';     
import { ApplyCreditComponent } from './pages/account/credit/apply-credit/apply-credit.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { 
        path: 'account', 
        component: AccountComponent,
        children: [
            { path: '', redirectTo: 'payment', pathMatch: 'full' }, // Redirect account to account/profile
            { path: 'payment', component: PaymentComponent }, // Tạm dùng SavingsComponent, có thể tạo ProfileComponent riêng
            { path: 'saving', component: SavingsComponent }, // Có thể tạo TransactionsComponent
            { path: 'payment/detail/:accountNumber', component: DetailComponent },
            { path: 'credit', component: CreditComponent },
            { path: 'credit/register', component: RegisterCreditComponent },
            { path: 'credit/register/apply-credit/:cardID', component: ApplyCreditComponent },  
        ]
        },
        { path: '**', component: NotFoundComponent },
];
