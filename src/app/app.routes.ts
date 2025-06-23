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
import { DashboardLoanComponent } from './loan/dashboard-loan/dashboard-loan.component';
import { ApplyNewLoanComponent } from './loan/apply-new-loan/apply-newloan.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';
import { CustomerAccountsComponent } from './customer/customer-accounts/customer-accounts.component';
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
    
import { AboutComponent } from './pages/about/about.component';
import { OrverviewLoanComponent } from './loan/my-loans-overview/orverview-loan.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DetailLoanComponent } from './loan/detail-loan/detail-loan.component';
import { DetailLoanRejectComponent } from './loan/detail-loan-reject/detail-loan-reject.component';
import { PendingLoanListComponent } from './loan-employee/pending-loans-list/pending-loans-list.component';
import { LoanDetailViewComponent } from './loan-employee/loan-detail-view/loan-detail-view.component';
import { CurrentRepaymentScheduleComponent } from './loan/current-repayment-schedule/current-repayment-schedule.component';
import { PayRepaymentComponent } from './loan/pay-repayment/pay-repayment.component';
import { LoanHistoryComponent } from './loan/loan-history/loan-history.component';
import { WarningApplyLoanComponent } from './loan/warning-apply-loan/warning-apply-loan.component';

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

      { path: 'customers', component: CustomerListComponent, canActivate: [KycGuard] },
      { path: 'customers/detail/:cifCode', component: CustomerDetailAdminComponent, canActivate: [KycGuard] },
      { path: 'transactions', component: TransactionHomeComponent, canActivate: [KycGuard]   },
      { path: 'transactions/transfer', component: TransferComponent, canActivate: [KycGuard]   },
      { path: 'transactions/deposit', component: DepositComponent, canActivate: [KycGuard]   },
      { path: 'transactions/withdraw', component: WithdrawComponent, canActivate: [KycGuard]   },
      { path: 'transactions/transaction-result', component: TransactionResultComponent, canActivate: [KycGuard]   },
      { path: 'transactions/history', component: TransactionHistoryComponent, canActivate: [KycGuard]   },
      { path: 'transactions/detail/:referenceCode', component: TransactionDetailComponent, canActivate: [KycGuard]   },
      { path: 'transactions/payment', component: PaymentSelectionComponent, canActivate: [KycGuard]   },
      { path: 'transactions/payment/:type', component: BillLookupComponent, canActivate: [KycGuard]   },
      { path: 'transactions/pay-bill', component: PayBillComponent, canActivate: [KycGuard]   },
      { path: 'loans', component: DashboardLoanComponent },
      { path: 'loans/create', component: ApplyNewLoanComponent },
      { path: 'loans/overview', component: OrverviewLoanComponent },
      { path: 'loans/history', component: LoanHistoryComponent },
      { path: 'loans/current', component: CurrentRepaymentScheduleComponent },
      { path: 'loans/pay/:id', component: PayRepaymentComponent },
      { path: 'loans/detail/:id', component: DetailLoanComponent },
      { path: 'loans/reject/:id', component: DetailLoanRejectComponent },
      { path: 'employee/loans', component: PendingLoanListComponent },
      { path: 'employee/loans/pending', component: PendingLoanListComponent },
      { path: 'employee/loans/:id', component: LoanDetailViewComponent },
      { path: 'loan/current-repayments', redirectTo: '' },
      { path: 'loan/warning-apply-loan', component: WarningApplyLoanComponent },
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
  

    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'savings', component: SavingsComponent },

];
