import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { AboutComponent } from './pages/about/about.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { CustomerListComponent } from './admin/customer-list/customer-list.component';
import { AdminGuard } from './core/guards/admin.guard';
import { CustomerDetailComponent } from './customer/customer-detail/customer-detail.component';
import { CustomerAccountsComponent } from './customer/customer-accounts/customer-accounts.component';
import { KycGuard } from './core/guards/kyc.guard';
import { CustomerDetailAdminComponent } from './admin/customer-detail/customer-detail-admin.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { KycOtpComponent } from './auth/kyc-otp/kyc-otp.component';
import { KycComponent } from './customer/kyc/kyc.component';
import { CreditComponent } from './pages/account/credit/credit.component';
import { AccountComponent } from './pages/account/account.component';
import { DetailComponent } from './pages/account/payment/detail/detail.component';
import { PaymentComponent } from './pages/account/payment/payment.component';
import { RegisterCreditComponent } from './pages/account/credit/register-credit/register-credit.component';
import { ApplyCreditComponent } from './pages/account/credit/apply-credit/apply-credit.component';
import { CreditDetailComponent } from './pages/account/credit/detail/credit-detail.component';
export const routes: Routes = [
  // Layout cho các route cần đăng nhập
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [KycGuard] },
      { path: 'detail', component: CustomerDetailComponent, canActivate: [KycGuard]  },
      { path: 'customers/accounts', component: CustomerAccountsComponent, canActivate: [KycGuard] },
      { path: 'home', component: HomeComponent, canActivate: [KycGuard] },
      { path: 'about', component: AboutComponent, canActivate: [KycGuard] },
      { path: 'savings', component: SavingsComponent, canActivate: [KycGuard] },
      { 
        path: 'account', 
        component: AccountComponent,
        children: [
            { path: '', redirectTo: 'payment', pathMatch: 'full' }, // Redirect account to account/profile
            { path: 'payment', component: PaymentComponent }, // Tạm dùng SavingsComponent, có thể tạo ProfileComponent riêng
            { path: 'saving', component: SavingsComponent }, // Có thể tạo TransactionsComponent
            { path: 'payment/detail/:accountNumber', component: DetailComponent },
            { path: 'credit', component: CreditComponent },
            { path: 'credit/detail/:cardAccountNumber', component: CreditDetailComponent },
            { path: 'credit/register', component: RegisterCreditComponent },
            { path: 'credit/register/apply-credit/:cardID', component: ApplyCreditComponent },  
        ]
        },  
      { path: 'customers', component: CustomerListComponent, canActivate: [KycGuard] },
      { path: 'customers/detail/:cifCode', component: CustomerDetailAdminComponent, canActivate: [KycGuard] },
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
      { path: 'kyc-otp', component: KycOtpComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'confirm-otp', component: VerifyOtpComponent },
    ]
  },
  

  // Not Found
  { path: '**', component: NotFoundComponent }
];