import { Routes } from '@angular/router';
import { TransferComponent } from './transactions/transfer/transfer.component';
import { TransactionHomeComponent } from './transactions/transaction-home/transaction-home.component';
import { DepositComponent } from './transactions/deposit/deposit.component';
import { WithdrawComponent } from './transactions/withdraw/withdraw.component';
import { TransactionResultComponent } from './transactions/results/transaction-result.component';
import { TransactionHistoryComponent } from './transactions/history/transaction-history.component';
import { TransactionDetailComponent } from './transactions/detail/transaction-detail.component';
import { PaymentSelectionComponent } from './transactions/payment-selection/payment-selection.component';
import { BillLookupComponent } from './transactions/bill-lockup/bill-lookup.component';
import { PayBillComponent } from './transactions/pay-bill/pay-bill.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { KycGuard } from './core/guards/kyc.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { CustomerDetailComponent } from './customer/customer-detail/customer-detail.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';
import { CustomerAccountsComponent } from './customer/customer-accounts/customer-accounts.component';
import { AboutComponent } from './pages/about/about.component';
import { SavingsComponent } from './pages/savings/savings.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { CustomerListComponent } from './admin/customer-list/customer-list.component';
import { CustomerDetailAdminComponent } from './admin/customer-detail/customer-detail-admin.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { KycComponent } from './auth/kyc/kyc.component';
import { TransactionListComponent } from './admin/transaction/transaction-list/transaction-list.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { ExternalTransferComponent } from './transactions/external-transfer/external-transfer.component';
    
export const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'customer-dashboard', pathMatch: 'full' },
      { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [KycGuard] },
      { path: 'detail', component: CustomerDetailComponent, canActivate: [KycGuard]  },
      { path: 'customers/accounts', component: CustomerAccountsComponent, canActivate: [KycGuard] },
      { path: 'home', component: HomeComponent, canActivate: [KycGuard] },
      { path: 'about', component: AboutComponent, canActivate: [KycGuard] },
      { path: 'savings', component: SavingsComponent, canActivate: [KycGuard] },
      { path: 'admin/transactions', component: TransactionListComponent, canActivate: [KycGuard] },


      { path: 'customers', component: CustomerListComponent, canActivate: [KycGuard] },
      { path: 'customers/detail/:cifCode', component: CustomerDetailAdminComponent, canActivate: [KycGuard] },
      { path: 'transactions', component: TransactionHomeComponent, canActivate: [KycGuard]   },
      { path: 'transactions/transfer', component: TransferComponent, canActivate: [KycGuard]   },
      { path: 'transactions/external-transfer', component: ExternalTransferComponent, canActivate: [KycGuard]   },
      { path: 'transactions/deposit', component: DepositComponent, canActivate: [KycGuard]   },
      { path: 'transactions/withdraw', component: WithdrawComponent, canActivate: [KycGuard]   },
      { path: 'transactions/transaction-result', component: TransactionResultComponent, canActivate: [KycGuard]   },
      { path: 'transactions/history', component: TransactionHistoryComponent, canActivate: [KycGuard]   },
      { path: 'transactions/detail/:referenceCode', component: TransactionDetailComponent, canActivate: [KycGuard]   },
      { path: 'transactions/payment', component: PaymentSelectionComponent, canActivate: [KycGuard]   },
      { path: 'transactions/payment/:type', component: BillLookupComponent, canActivate: [KycGuard]   },
      { path: 'transactions/pay-bill', component: PayBillComponent, canActivate: [KycGuard]   },
    ]
  },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard, KycGuard] },

  { path: 'kyc', component: KycComponent, canActivate: [AuthGuard] },
  
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'verify-otp', component: VerifyOtpComponent },
    ]
  },
  { path: 'forbidden', component: ForbiddenComponent },
];
