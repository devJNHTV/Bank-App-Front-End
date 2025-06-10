import { Routes } from "@angular/router";
import { AccountComponent } from "./account.component";
import { SavingsComponent } from "../savings/savings.component";
import { PaymentComponent } from "./payment/payment.component";
import { CreditComponent } from "./credit/credit.component";

export const accountRoutes: Routes = [
    {
      path: '',
      component: AccountComponent,
      children: [
        { path: 'payment', component: PaymentComponent },
        { path: 'savings', component: SavingsComponent },
        { path: 'credit', component: CreditComponent },
        { path: '', redirectTo: 'payment', pathMatch: 'full' }
      ]
    }
  ];
  