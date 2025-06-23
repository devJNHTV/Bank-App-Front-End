import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { ApiEndpointsService } from './api-endpoints.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private apiEndpointsService: ApiEndpointsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  register(userData: any): Observable<any> {
    console.log('Registering user:', userData);
    return this.http.post(this.apiEndpointsService.getRegisterEndpoint(), userData).pipe(
      tap((response) => {
        console.log('Register Response:', response);
        if (isPlatformBrowser(this.platformId)) {
          this.storageService.setItem('registerEmail', userData.email);
        }
      }),
      catchError((error) => {
        console.error('Register Error:', error);
        return throwError(() => new Error('Đăng ký thất bại: ' + error.error.message));
      })
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post(this.apiEndpointsService.getConfirmRegisterEndpoint(), {}, { params }).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.storageService.removeItem('registerEmail');
        }
      }),
      catchError((error) =>
        throwError(() => new Error('Xác minh OTP thất bại: ' + error.error.message))
      )
    );
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(this.apiEndpointsService.getForgotPasswordEndpoint(), { email }).pipe(
      catchError((error) =>
        throwError(() => new Error('Gửi lại mã OTP thất bại: ' + error.error.message))
      )
    );
  }
}