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

  // Bước 1: Khởi tạo đăng ký
  initiateRegister(userData: any): Observable<any> {
    console.log('Initiating registration for:', userData);
    return this.http
      .post(this.apiEndpointsService.getRegisterInitiateEndpoint(), userData, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        tap((response) => {
          console.log('Initiate Register Response:', response);
          if (isPlatformBrowser(this.platformId)) {
            this.storageService.setItem('registerEmail', userData.email);
          }
        }),
        catchError((error) => {
          console.error('Initiate Register Error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Khởi tạo đăng ký thất bại')
          );
        })
      );
  }

  // Bước 2: Xác minh KYC & gửi OTP
  processKycAndSendOtp(email: string, kycData: any): Observable<any> {
    console.log('Processing KYC and OTP for:', email);
    return this.http
      .post(this.apiEndpointsService.getKycAndOtpEndpoint(), kycData, {
        params: { email },
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        tap((response) => {
          console.log('KYC and OTP Response:', response);
        }),
        catchError((error) => {
          console.error('KYC and OTP Error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Xác minh KYC thất bại')
          );
        })
      );
  }

  // Bước 3: Xác minh OTP
  verifyOtp(email: string, otp: string): Observable<any> {
    console.log('Verifying OTP for:', email);
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http
      .post(this.apiEndpointsService.getConfirmRegisterEndpoint(), null, { params })
      .pipe(
        tap((response) => {
          console.log('OTP Verification Success:', response);
          if (isPlatformBrowser(this.platformId)) {
            this.storageService.removeItem('registerEmail');
          }
        }),
        catchError((error) => {
          console.error('OTP Verification Error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Xác minh OTP thất bại')
          );
        })
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