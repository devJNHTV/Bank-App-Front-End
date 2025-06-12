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
import { KycComponent } from './auth/kyc/kyc.component';
import { CustomerListComponent } from './admin/customer-list/customer-list.component';
import { AdminGuard } from './core/guards/admin.guard';
import { CustomerDetailComponent } from './customer/customer-detail/customer-detail.component';
import { CustomerAccountsComponent } from './customer/customer-accounts/customer-accounts.component';
import { KycGuard } from './core/guards/kyc.guard';
import { CustomerDetailAdminComponent } from './admin/customer-detail/customer-detail-admin.component';
import { CustomerDashboardComponent } from './customer/customer-dashboard/customer-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'kyc', component: KycComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'customers/accounts', component: CustomerAccountsComponent, canActivate: [AuthGuard, AuthGuard] },
    { path: 'detail', component: CustomerDetailComponent, canActivate: [AuthGuard, AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'verify-otp', component: VerifyOtpComponent },
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
    { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard, KycGuard] },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'savings', component: SavingsComponent },
    // { 
    //   path: 'admin',
    //   canActivate: [AuthGuard, AdminGuard],
    //   children: [
        { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
        { path: 'customers/detail/:cifCode', component: CustomerDetailAdminComponent, canActivate: [AuthGuard] },
    //   ]
    // },
    { path: '**', component: NotFoundComponent },
];
