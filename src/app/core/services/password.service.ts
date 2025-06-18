import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiEndpointsService } from './api-endpoints.service';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  constructor(
    private http: HttpClient,
    private apiEndpointsService: ApiEndpointsService
  ) {}

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(this.apiEndpointsService.getResetPasswordEndpoint(), { token, newPassword, confirmPassword }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đặt lại mật khẩu thất bại: ' + error.error.message))
      )
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.put(this.apiEndpointsService.getUpdatePasswordEndpoint(), { currentPassword, newPassword, confirmPassword }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đổi mật khẩu thất bại: ' + error.error.message))
      )
    );
  }
}