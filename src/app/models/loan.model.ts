import { Repayment } from './repayment.model';
import { LoanStatus } from "./loanStatus .model";
import { LoanRejectionReason } from "./LoanRejectionReason.model";
export interface Loan {
  loanId: number| null;
  customerId: number| null;
  accountNumber: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  declaredIncome: number;
  status: LoanStatus | null;
  createdAt: string| null;
  approvedAt: string | null;
  repayments: Repayment[]|null;
  rejectionReasons: LoanRejectionReason[]|null;
}