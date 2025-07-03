import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiEndpointsService } from './api-endpoints.service';
import { KycStatisticsResponse } from '../models/KycStatisticsResponse';
import { CustomerGrowthResponse } from '../models/CustomerGrowthResponse';
import { ApiResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  private isKycVerifiedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private apiEndpointsService: ApiEndpointsService
  ) {}

  checkKycStatus(): Observable<{ verified: boolean }> {
    console.log('Checking KYC status...');
    return this.http.get<{ verified: boolean }>(this.apiEndpointsService.getKycStatusEndpoint()).pipe(
      tap((res) => {
        console.log('KYC Status Response:', res);
        this.isKycVerifiedSubject.next(res.verified);
      }),
      catchError((error) => {
        console.error('KYC Status Check Error:', error?.message);
        this.isKycVerifiedSubject.next(false);
        return throwError(() => new Error('Không thể kiểm tra trạng thái KYC: ' + (error?.error?.message || error?.message || 'Unknown error')));
      })
    );
  }

  verifyKyc(kycData: any): Observable<any> {
    return this.http.post(this.apiEndpointsService.getKycVerifyEndpoint(), kycData).pipe(
      tap((res: any) => {
        if (res.isVerified) this.isKycVerifiedSubject.next(true);
      }),
      catchError((error) =>
        throwError(() => new Error('Xác minh KYC thất bại: ' + (error?.error?.message || error?.message || 'Unknown error')))
      )
    );
  }

  isKycVerified(): Observable<boolean> {
    return this.isKycVerifiedSubject.asObservable();
  }

  getKycVerifiedValue(): boolean {
    return this.isKycVerifiedSubject.getValue();
  }
}