import { HttpClient } from '@angular/common/http';
import { Customer } from '../../interfaces/customer.inteface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8888/api/customers';  
  token = localStorage.getItem('access-token');
  constructor(private http: HttpClient) { }

  getCustomerInfo(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/detail`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

}
