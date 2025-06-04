import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, Term } from '../../interfaces/account.interface';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8888/account';
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

  createAccount(formData: any): Observable<any> {
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
}     
