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
export interface AccountSavings {
    accountNumber: string;
    cifCode: string;
    accountType: string;
    balance: number;
    status: string;
    openedDate: Date;
    interestRate: number;
    initialDeposit: number;
    termValueMonths: number;
    renewOption: string;   
    interestPaymentType: string;
}
export interface creditCards
{
    cardID: string;  
    typeName: string;
    defaultCreditLimit: number;
    interestRate: number;
    annualFee: number;
    minimumIncome: number;
    imgURL: string;     
}