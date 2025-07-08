import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponseWrapper } from '../../models/api-response-wrapper.model';
import { Customer } from '../../interfaces/customer.inteface';

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private apiUrl = 'http://localhost:8888/api/customers';
  constructor(private http: HttpClient) { }
  getKycStatus(): Observable<ApiResponseWrapper<Customer>> {
    return this.http.get<ApiResponseWrapper<Customer>>(`${this.apiUrl}/status`).pipe(
      catchError((error) => {
        console.error('Lỗi khi lấy trạng thái KYC:', error);
        return throwError(() => new Error('Lỗi khi lấy trạng thái KYC: ' + (error?.error?.message || error?.message || 'Unknown error')));
      })
    );
  } 

}


