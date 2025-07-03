import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan} from '../models/loan.model';
import { ApiResponseWrapper} from '../models/api-response-wrapper.model';
import { LoanRejectionReason } from '../models/LoanRejectionReason.model';
import { CustomerResponse } from '../interfaces/customerResponse';
import { Account } from '../interfaces/account.interface';
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  // URL gốc của backend Java
  private readonly baseUrl = 'http://localhost:8888/api/loans';

  constructor(
    private http: HttpClient
  ) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  // 1. POST: Tạo khoản vay mới
  createLoan(loan: Loan): Observable<ApiResponseWrapper<Loan>> {
    return this.http.post<ApiResponseWrapper<Loan>>(this.baseUrl, loan,{ headers: this.getAuthHeaders() });
  }

  // 2. PUT: Cập nhật khoản vay
  updateLoan(loan: Loan): Observable<ApiResponseWrapper<Loan>> {
    return this.http.put<ApiResponseWrapper<Loan>>(this.baseUrl, loan,{ headers: this.getAuthHeaders() });
  }

  // 3. POST: Phê duyệt khoản vay
  approveLoan(loanId: number): Observable<ApiResponseWrapper<Loan>> {
    return this.http.post<ApiResponseWrapper<Loan>>(`${this.baseUrl}/${loanId}/approve`, {}, { headers: this.getAuthHeaders() });
  }

  // 4. POST: Đóng khoản vay
  closeLoan(loanId: number): Observable<ApiResponseWrapper<Loan>> {
    return this.http.post<ApiResponseWrapper<Loan>>(`${this.baseUrl}/${loanId}/close`, {},{ headers: this.getAuthHeaders() });
  }

  // 5. POST: Từ chối khoản vay
  rejectLoan(loanId: number, rejection: LoanRejectionReason): Observable<ApiResponseWrapper<Loan>> {
    return this.http.post<ApiResponseWrapper<Loan>>(`${this.baseUrl}/${loanId}/reject`, rejection,{ headers: this.getAuthHeaders() });
  }

  // 6. GET: Lấy khoản vay theo ID
  getLoanById(loanId: number): Observable<ApiResponseWrapper<Loan>> {
    return this.http.get<ApiResponseWrapper<Loan>>(`${this.baseUrl}/${loanId}`, { headers: this.getAuthHeaders() });
  }

  // 7. GET: Lấy danh sách khoản vay theo customerId
  async getLoansByCustomerId(): Promise<Observable<ApiResponseWrapper<Loan[]>>> {
    return this.http.get<ApiResponseWrapper<Loan[]>>(`${this.baseUrl}/customer`,{ headers: this.getAuthHeaders() });
  }

  // 8. DELETE: Xóa khoản vay
  deleteLoan(loanId: number): Observable<ApiResponseWrapper<void>> {
    return this.http.delete<ApiResponseWrapper<void>>(`${this.baseUrl}/${loanId}`,{ headers: this.getAuthHeaders() });
  }

  // 9. GET: Lấy tất cả khoản vay
  getAllLoans(): Observable<ApiResponseWrapper<Loan[]>> {
    return this.http.get<ApiResponseWrapper<Loan[]>>(`${this.baseUrl}/getAllloans`,{ headers: this.getAuthHeaders() });
  }

  // 10. GET: Lấy tổng số tiền đã vay
  getTotalBorrowed(): Observable<ApiResponseWrapper<number>> {
    return this.http.get<ApiResponseWrapper<number>>(`${this.baseUrl}/total-borrowed`,{ headers: this.getAuthHeaders() });
  }

  // 11. GET: Lấy tổng số tiền chưa thanh toán
  getTotalOutstanding(): Observable<ApiResponseWrapper<number>> {
    return this.http.get<ApiResponseWrapper<number>>(`${this.baseUrl}/total-outstanding`,{ headers: this.getAuthHeaders() });
  }
  getCustomerDetail(userId: string): Observable<ApiResponseWrapper<CustomerResponse>> {
    return this.http.get<ApiResponseWrapper<CustomerResponse>>(`${this.baseUrl}/getCustomerById/${userId}`,{ headers: this.getAuthHeaders() });
  }
  getAccountsByUserId(userId: string): Observable<ApiResponseWrapper<Account[]>> {
    return this.http.get<ApiResponseWrapper<Account[]>>(`${this.baseUrl}/getAccountsByUserId/${userId}`,{ headers: this.getAuthHeaders() });
  }
  getAccountsByCurrentUser(): Observable<ApiResponseWrapper<Account[]>> {
    return this.http.get<ApiResponseWrapper<Account[]>>(`${this.baseUrl}/getAccounts`,{ headers: this.getAuthHeaders() });
  }
  checkInfoIncome(infoIncome: any): Observable<ApiResponseWrapper<any>> {
    return this.http.post<ApiResponseWrapper<any>>(`${this.baseUrl}/check-info-income`, infoIncome, { headers: this.getAuthHeaders() });
  }
  createInfoIncome(infoIncome: any): Observable<ApiResponseWrapper<any>> {
    return this.http.post<ApiResponseWrapper<any>>('http://localhost:8888/api/info-income', infoIncome, { headers: this.getAuthHeaders() });
  }
  updateInfoIncome(infoId: number, infoIncome: any): Observable<ApiResponseWrapper<any>> {
    return this.http.put<ApiResponseWrapper<any>>(`http://localhost:8888/api/info-income/${infoId}`, infoIncome, { headers: this.getAuthHeaders() });
  }
  getInfoIncomesByLoanId(loanId: number): Observable<ApiResponseWrapper<any>> {
    return this.http.get<ApiResponseWrapper<any>>(`http://localhost:8888/api/info-income/loan/${loanId}`, { headers: this.getAuthHeaders() });
  }
} 