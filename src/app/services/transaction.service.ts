import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private baseUrl = 'http://localhost:8888';
  private baseUrlTransaction = 'http://localhost:8888/api/transactions';
 
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getAccountForCustomer(): Observable<any> {
    return this.http.get(`${this.baseUrl}/account/getAllPaymentAccount`, {
      headers: this.getAuthHeaders()
    });
  }
  getCurrentCustomer(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/customers/detail`, {
      headers: this.getAuthHeaders()
    });
  }
  getListToAccountNumberTransactioLatest(accountNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/get-latest-transaction/${accountNumber}`, {
      headers: this.getAuthHeaders()
    });
  }
  getTransactionByReferenceCode(referenceCode: string): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/${referenceCode}`, {
      headers: this.getAuthHeaders()
    });
  }
// Create Transaction

transfer(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrlTransaction}/transfer`, payload, {
    headers: this.getAuthHeaders()
  });
}
// Resend OTP
resendOtp(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrlTransaction}/resend-otp`, payload, {
    headers: this.getAuthHeaders()
  });
}
// Confirm Transaction
confirmTransaction(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrlTransaction}/confirm-transaction`, payload, {
    headers: this.getAuthHeaders()
  });
}

 getCustomerByAccountNumber(accountNumber: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/account/get-customer/${accountNumber}`, {
    headers: this.getAuthHeaders()
  }); 
 }
  getTransactionById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
// Deposit
deposit(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrlTransaction}/deposit`, payload, {
    headers: this.getAuthHeaders()
  });
}
// Withdraw
withdraw(payload: any): Observable<any> {
  console.log(payload);
  return this.http.post(`${this.baseUrlTransaction}/withdraw`, payload, {
    headers: this.getAuthHeaders()
  });
}
// Get Transaction History
  getTransactionHistory(params: any): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/getTransactionsAndFilter`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }
  getFilterMetadata(): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/getFilterMetadata`, {
      headers: this.getAuthHeaders()
    });
  }
}
