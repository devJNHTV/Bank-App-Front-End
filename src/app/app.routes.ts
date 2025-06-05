import { Routes } from '@angular/router';
import { TransferComponent } from './transactions/transfer/transfer.component';
import { ConfirmTransactionComponent } from './transactions/confirm/confirm-transaction.component.ts';
import { TransactionResultComponent } from './transactions/results/transaction-result.component';

export const routes: Routes = [
  { path: 'transfer', component: TransferComponent },
  { path: 'confirm-transaction', component: ConfirmTransactionComponent },
  { path: 'transaction-result', component: TransactionResultComponent },
];
