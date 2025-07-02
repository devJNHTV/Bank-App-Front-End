export interface Repayment {
  repaymentId: number;
  dueDate: string;
  principal: number;
  interest: number;
  paidAmount: number;
  status: string;
}