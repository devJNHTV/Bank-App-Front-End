import { Routes } from '@angular/router';
import { DashboardLoanComponent } from './loan/Dashboard Loan/dashboard-loan.component';
import { ApplyNewLoanComponent } from './loan/Apply New Loan/apply-newloan.component';
export const routes: Routes = [
    { path: 'allloan', component: DashboardLoanComponent },
    { path: 'loan/create',component: ApplyNewLoanComponent },
    { path: 'loan/overview', redirectTo: '' },
    { path: 'loan/history', redirectTo: '' },
    { path: 'loan/current', redirectTo: '' },
    { path: 'loan/current-repayments', redirectTo: '' }
];
