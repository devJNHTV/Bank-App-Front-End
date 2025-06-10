import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, Term, Transaction } from '../../interfaces/account.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8888/account';
  private apiUrlTransaction = 'http://localhost:8888/api/transactions';
  token = localStorage.getItem('access-token');
  constructor(private http: HttpClient) { }

  getAccounts(): Observable<Account[]>  {
    return this.http.get<Account[]>(`${this.apiUrl}/getAllPaymentAccount`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  } 

  getTerms(): Observable<Term[]> {
    return this.http.get<Term[]>(`${this.apiUrl}/get-all-term`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }); 
  }

  createSavingsAccount(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-savings-request`, formData, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
 

  verifyOtp(otpCode: string, savingRequestID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-otp-and-create-account`, {
      otpCode: otpCode,
      savingRequestID: savingRequestID
    }, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  resendOtp(transactionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp/${transactionId}`, {}, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Payment Account
  createPaymentAccount(cifCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-payment-request/${cifCode}`, {
    }, {
      headers: {    
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  verifyOtpPaymentAccount(otpCode: string, paymentRequestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-otp-payment`, {
      otpCode: otpCode,
      paymentRequestId: paymentRequestId
    }, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  resendOtpPaymentAccount(transactionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-payment-otp/${transactionId}`, {}, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
  getAccountByAccountNumber(accountNumber: string): Observable<any> {
    return this.http.get<Account>(`${this.apiUrl}/getAccountPaymentByID/${accountNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }); 
  }
  getTransactions(accountNumber: string): Observable<any> {
    return this.http.get<Transaction[]>(`${this.apiUrlTransaction}/account/${accountNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}     
