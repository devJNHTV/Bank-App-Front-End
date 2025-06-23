import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repayment} from '../models/repayment.model';
import { ApiResponseWrapper} from '../models/api-response-wrapper.model';

@Injectable({
  providedIn: 'root'
})
export class RepaymentService {
  private readonly apiUrl = 'http://localhost:8888/api/repayments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
        'Authorization': `Bearer ${token}`
    });
  }
  // 1. GET: Lấy danh sách repayments theo loanId
  getRepaymentsByLoanId(loanId: number): Observable<ApiResponseWrapper<Repayment[]>> {
    return this.http.get<ApiResponseWrapper<Repayment[]>>(`${this.apiUrl}/loan/${loanId}`,{ headers: this.getAuthHeaders() });
  }

  // 2. GET: Lấy repayment theo ID
  getRepaymentById(repaymentId: number): Observable<ApiResponseWrapper<Repayment>> {
    return this.http.get<ApiResponseWrapper<Repayment>>(`${this.apiUrl}/${repaymentId}`,{ headers: this.getAuthHeaders() });
  }

  // 3. PATCH: Cập nhật trạng thái repayment thành "LATE"
  updateLateRepaymentStatus(repaymentId: number): Observable<ApiResponseWrapper<Repayment>> {
    return this.http.patch<ApiResponseWrapper<Repayment>>(`${this.apiUrl}/${repaymentId}/late`, { headers: this.getAuthHeaders() });
  }

  // 4. PATCH: Cập nhật trạng thái repayment thành "UNPAID"
  updateUnpaidRepaymentStatus(repaymentId: number): Observable<ApiResponseWrapper<Repayment>> {
    return this.http.patch<ApiResponseWrapper<Repayment>>(`${this.apiUrl}/${repaymentId}/unpaid`, { headers: this.getAuthHeaders() });
  }

  // 5. POST: Thực hiện thanh toán repayment
  makeRepayment(repaymentId: number, amount: number, accountNumber : string): Observable<ApiResponseWrapper<void>> {
    const params = new HttpParams().set('amount', amount.toString()) .set('accountNumber', accountNumber);
    return this.http.post<ApiResponseWrapper<void>>(`${this.apiUrl}/${repaymentId}/pay`, null, { headers: this.getAuthHeaders(), params });
    
  }

  // 6. POST: Xác nhận thanh toán repayment
  confirmRepayment(repaymentId: number, amount: number, otpCode: string, referenceCode: string): Observable<ApiResponseWrapper<Repayment>> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('otpCode', otpCode)
      .set('referenceCode', referenceCode);
    return this.http.post<ApiResponseWrapper<Repayment>>(`${this.apiUrl}/${repaymentId}/confirm`, null, { headers: this.getAuthHeaders(), params });
  }
  
  // 7. GET: Lấy lịch sử repayments của một khoản vay
  getRepaymentHistory(): Observable<ApiResponseWrapper<Repayment[]>> {
    return this.http.get<ApiResponseWrapper<Repayment[]>>(`${this.apiUrl}/history`,{ headers: this.getAuthHeaders() });
  }

  // 8. GET: Lấy repayment hiện tại của một khoản vay
  getCurrentRepayment(): Observable<ApiResponseWrapper<Repayment>> {
    return this.http.get<ApiResponseWrapper<Repayment>>(`${this.apiUrl}/current`,{ headers: this.getAuthHeaders() });
  }

  // 9. DELETE: Xóa tất cả repayments của một khoản vay
  deleteRepaymentsByLoanId(loanId: number): Observable<ApiResponseWrapper<void>> {
    return this.http.delete<ApiResponseWrapper<void>>(`${this.apiUrl}/loan/${loanId}`,{ headers: this.getAuthHeaders() });
  }
}