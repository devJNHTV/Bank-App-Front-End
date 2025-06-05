import { Repayment } from './repayment.model';

export interface Loan {
  loanId: number| null;
  customerId: number| null;
  accountNumber: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  declaredIncome: number;
  status: string;
  createdAt: string| null;
  approvedAt: string | null;
  repayments: Repayment[]|null;
}