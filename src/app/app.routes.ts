import { Routes } from '@angular/router';
import { DashboardLoanComponent } from './loan/dashboard-loan/dashboard-loan.component';
import { ApplyNewLoanComponent } from './loan/apply-new-loan/apply-newloan.component';
import { HomeComponent } from './pages/home/home.component';
import { SavingsComponent } from './pages/savings/savings.component';
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

export const routes: Routes = [
    { path: 'allloan', component: DashboardLoanComponent },
    { path: 'loan/create', component: ApplyNewLoanComponent },
    { path: 'loan/history', component: LoanHistoryComponent },
    { path: 'loan/current-repayments', redirectTo: '' },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'savings', component: SavingsComponent },
    { path: 'loan/overview', component: OrverviewLoanComponent },
    { path: 'detail/loan/:id', component: DetailLoanComponent },
    { path: 'detail/loan/reject/:id', component: DetailLoanRejectComponent },
    { path: 'employee/loans/pending', component: PendingLoanListComponent },
    { path: 'employee/loans/:id', component: LoanDetailViewComponent },
    { path: 'loan/current', component: CurrentRepaymentScheduleComponent },
    { path: 'loan/pay-repayment/:id', component: PayRepaymentComponent }
];
