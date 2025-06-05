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
// Create Transaction

transfer(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrlTransaction}/transfer`, payload, {
    headers: this.getAuthHeaders()
  });
}
  getTransactionById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrlTransaction}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  
}
