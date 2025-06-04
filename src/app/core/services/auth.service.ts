import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasTokenSync()
  );
  private apiUrl = environment.apiUrl;
  private keycloakUrl = environment.keycloak.url;
  private clientId = environment.keycloak.clientId;
  private clientSecret = environment.keycloak.clientSecret;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('registerEmail', userData.email);
        }
        console.log(localStorage.getItem('registerEmail'));
      }),
      catchError((error) =>
        throwError(() => new Error('Đăng ký thất bại: ' + error.error.message))
      )
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http
      .post(`${this.apiUrl}/confirm-register`, {}, { params })
      .pipe(
        tap(() => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('registerEmail');
          }
        }),
        catchError((error) =>
          throwError(
            () => new Error('Xác minh OTP thất bại: ' + error.error.message)
          )
        )
      );
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', username)
      .set('password', password);

    return this.http
      .post(this.keycloakUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((response: any) => {
          if (isPlatformBrowser(this.platformId)) {
            if (response.access_token) {
              localStorage.setItem(this.tokenKey, response.access_token);
            }
            if (response.refresh_token) {
              localStorage.setItem(
                this.refreshTokenKey,
                response.refresh_token
              );
            }
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) =>
          throwError(
            () =>
              new Error(
                'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập hoặc mật khẩu.'
              )
          )
        )
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(
        () => new Error('Không có refresh token. Vui lòng đăng nhập lại.')
      );
    }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('refresh_token', refreshToken);

    return this.http
      .post(this.keycloakUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((response: any) => {
          if (isPlatformBrowser(this.platformId)) {
            if (response.access_token) {
              localStorage.setItem(this.tokenKey, response.access_token);
            }
            if (response.refresh_token) {
              localStorage.setItem(
                this.refreshTokenKey,
                response.refresh_token
              );
            }
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
      this.isAuthenticatedSubject.next(true);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      return token;
    }
    try {
      const response: any = await firstValueFrom(this.refreshToken());
      return response.access_token || null;
    } catch (err) {
      return null;
    }
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() >= expiry;
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true;
    }
  }

  hasTokenSync(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        return !this.isTokenExpired(token);
      }
    }
    return false;
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { email }).pipe(
      catchError((error) =>
        throwError(() => new Error('Gửi lại mã OTP thất bại: ' + error.error.message))
      )
    );
  }

  resetPassword(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { password }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đặt lại mật khẩu thất bại: ' + error.error.message))
      )
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đổi mật khẩu thất bại: ' + error.error.message))
      )
    );
  }
}
