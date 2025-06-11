import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, from, firstValueFrom } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenResponse } from '../models/TokenResponse'; 
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { ApiEndpointsService } from './api-endpoints.service';
import { KycService } from './kyc.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private refreshTokenPromise: Promise<TokenResponse> | null = null;
  private isKycVerifiedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private kycService: KycService,
    private apiEndpointsService: ApiEndpointsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('Keycloak URL:', this.apiEndpointsService.getKeycloakUrl());
  }

  initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId) && this.hasTokenSync()) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(username: string, password: string): Observable<any> {
    console.log('Attempting login for user:', username);
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', environment.keycloak.clientId)
      .set('client_secret', environment.keycloak.clientSecret)
      .set('username', username)
      .set('password', password);

    return this.http.post(environment.keycloak.url, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(
      tap((res: any) => {
        console.log('Login Response:', res);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.tokenKey, res.access_token);
          localStorage.setItem(this.refreshTokenKey, res.refresh_token);
        }
        this.isAuthenticatedSubject.next(true);

        // Gọi check KYC
        this.kycService.checkKycStatus().subscribe({
          next: ({ verified }) => {
            console.log('KYC Check after login:', verified);
            this.isKycVerifiedSubject.next(verified);
            this.router.navigate([verified ? '/dashboard' : '/kyc'], {
              queryParams: !verified ? { message: 'Vui lòng xác minh danh tính' } : {},
            });
          },
          error: (error) => {
            console.error('KYC Check Error after login:', error);
            this.router.navigate(['/kyc'], {
              queryParams: { message: 'Vui lòng xác minh danh tính' },
            });
          },
        });
      }),

      catchError((error) => {
        console.error('Login Error:', error);
        return throwError(() =>
          new Error('Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập hoặc mật khẩu.')
        );
      })
    );
  }


  logout(): void {
    this.storageService.clear();
    this.isAuthenticatedSubject.next(false);
    this.notificationService.showSuccess('Hẹn gặp lại bạn!', 'Đăng xuất thành công').then(() => {
      this.router.navigate(['/login']).then(() => {
        location.reload();
      });
    });
  }

  refreshToken(): Observable<TokenResponse> {
    if (this.refreshTokenPromise) {
      return from(this.refreshTokenPromise);
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleSessionExpired('Phiên đăng nhập đã hết hạn');
      return throwError(() => new Error('Không có refresh token'));
    }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.keycloak.clientId)
      .set('client_secret', environment.keycloak.clientSecret)
      .set('refresh_token', refreshToken);

    const refreshRequest = this.http
      .post<TokenResponse>(this.apiEndpointsService.getKeycloakUrl(), body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((res: TokenResponse) => {
          console.log('Refresh token thành công');
          this.storageService.setItem(this.tokenKey, res.access_token);
          this.storageService.setItem(this.refreshTokenKey, res.refresh_token);
        }),
        catchError((error) => {
          console.error('Lỗi refresh token:', error);
          return throwError(() => new Error('Không thể làm mới token: ' + (error?.error?.message || 'Lỗi không xác định')));
        })
      );

    this.refreshTokenPromise = firstValueFrom(refreshRequest);

    return refreshRequest.pipe(
      finalize(() => {
        this.refreshTokenPromise = null;
      })
    );
  }

  async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) {
      console.warn('Không có token, chuyển hướng đến trang đăng nhập');
      this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      return null;
    }

    if (this.isTokenExpired(token) || this.isTokenExpiringSoon(token)) {
      try {
        const res = await firstValueFrom(this.refreshToken());
        return res.access_token || null;
      } catch (err) {
        console.error('Lỗi khi làm mới token:', err);
        this.logout();
        return null;
      }
    }

    return token;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      console.log('Token exp:', new Date(exp), 'Now:', new Date());
      return Date.now() >= exp;
    } catch (err) {
      console.error('Lỗi decode token:', err);
      return true;
    }
  }

  isTokenExpiringSoon(token: string, seconds: number = 30): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp - now < seconds;
    } catch (e) {
      return true;
    }
  }

  getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem(this.refreshTokenKey);
  }

  saveToken(token: string): void {
    this.storageService.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
  }

  hasTokenSync(): boolean {
    const token = this.storageService.getItem(this.tokenKey);
    return token ? !this.isTokenExpired(token) : false;
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private handleSessionExpired(message: string): void {
    this.storageService.clear();
    this.isAuthenticatedSubject.next(false);
    this.notificationService.showWarning(message, 'Phiên đăng nhập hết hạn').then(() => {
      this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
    });
  }
}