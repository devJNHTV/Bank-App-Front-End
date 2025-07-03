import { Repayment } from './repayment.model';
import { LoanStatus } from "./loanStatus .model";
import { LoanRejectionReason } from "./LoanRejectionReason.model";
import { InfoIncome } from './infoIncome.model';
export interface Loan {
  loanId: number| null;
  customerId: number| null;
  accountNumber: string;
  amount: number;
  interestRate: number;
  infoIncomes: InfoIncome[] | null;
  termMonths: number;
  status: LoanStatus | null;
  createdAt: string| null;
  approvedAt: string | null;
  repayments: Repayment[]|null;
  rejectionReasons: LoanRejectionReason[]|null;
}