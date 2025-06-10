export interface Account {
    accountNumber: string;
    balance: number;
    status: string;
    openedDate: Date;
    accountType: string;
  }
export interface Term {
    termValueMonths: number;
    interestRate: number;
}
export interface Transaction {
    id: string;
    fromAccountNumber: string;
    toAccountNumber: string;
    amount: number;
    description: string;
    timestamp: Date;
    status: string;
    type: string;
    currency: string;
    referenceCode: string;

   
}
