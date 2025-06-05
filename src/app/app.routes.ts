import { Routes } from '@angular/router';
import { DashboardLoanComponent } from './loan/Dashboard Loan/dashboard-loan.component';
import { ApplyNewLoanComponent } from './loan/Apply New Loan/apply-newloan.component';
import { HomeComponent } from './pages/home/home.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { AboutComponent } from './pages/about/about.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
export const routes: Routes = [
    { path: 'allloan', component: DashboardLoanComponent },
    { path: 'loan/create',component: ApplyNewLoanComponent },
    { path: 'loan/overview', redirectTo: '' },
    { path: 'loan/history', redirectTo: '' },
    { path: 'loan/current', redirectTo: '' },
    { path: 'loan/current-repayments', redirectTo: '' },
     { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'savings', component: SavingsComponent },
    { path: '**', component: NotFoundComponent },

];
