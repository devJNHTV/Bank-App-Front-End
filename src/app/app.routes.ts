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

export const routes: Routes = [
  { path: 'transactions', component: TransactionHomeComponent },
  { path: 'transactions/transfer', component: TransferComponent },
  { path: 'transactions/deposit', component: DepositComponent },
  { path: 'transactions/withdraw', component: WithdrawComponent },
  { path: 'transactions/transaction-result', component: TransactionResultComponent },
  { path: 'transactions/history', component: TransactionHistoryComponent },
  { path: 'transactions/detail/:referenceCode', component: TransactionDetailComponent },
  { path: 'transactions/payment', component: PaymentSelectionComponent },
  { path: 'transactions/payment/:type', component: BillLookupComponent },
  { path: 'transactions/pay-bill', component: PayBillComponent },
];
