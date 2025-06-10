import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenResponse } from '../../auth/TokenResponse'
import { BehaviorSubject, Observable, throwError, firstValueFrom, from } from 'rxjs';
import { catchError, tap, switchMap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  // private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasTokenSync());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private isKycVerifiedSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = environment.apiUrl;
  private keycloakUrl = environment.keycloak.url;
  private clientId = environment.keycloak.clientId;
  private clientSecret = environment.keycloak.clientSecret;
  private refreshTokenPromise: Promise<TokenResponse> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('API URL:', this.apiUrl);
    console.log('Keycloak URL:', this.keycloakUrl);
    // if (isPlatformBrowser(this.platformId) && this.hasTokenSync()) {
    //   this.restoreAuthState();
    // }
  }

  // Khởi tạo trạng thái xác thực khi cần
  initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId) && this.hasTokenSync()) {
      this.restoreAuthState();
    }
  }

  private restoreAuthState(): void {
    this.isAuthenticatedSubject.next(true);
    this.checkKycStatus().subscribe({
      next: (res) => {
        console.log('KYC Status Response:', res);
        this.isKycVerifiedSubject.next(res.verified);
      },
      error: (error) => {
        console.error('KYC Status Check Error:', error?.message || error);
        this.isKycVerifiedSubject.next(false);
      },
    });
    // Kiểm tra quyền ADMIN từ token
    const userInfo = this.getUserInfo();
    if (userInfo && userInfo.roles && userInfo.roles.includes('ADMIN')) {
      this.isAdminSubject.next(true);
    }
  }

  isAdmin(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  private checkAdminAccess(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.roles && userInfo.roles.includes('ADMIN');
  }

  register(userData: any): Observable<any> {
    console.log('Registering user:', userData);
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        console.log('Register Response:', response);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('registerEmail', userData.email);
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
    return this.http.post(`${this.apiUrl}/confirm-register`, {}, { params }).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('registerEmail');
        }
      }),
      catchError((error) =>
        throwError(() => new Error('Xác minh OTP thất bại: ' + error.error.message))
      )
    );
  }

  login(username: string, password: string): Observable<any> {
    console.log('Đang đăng nhập cho người dùng:', username);
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
        tap((res: any) => {
          console.log('Phản hồi đăng nhập:', res);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, res.access_token);
            localStorage.setItem(this.refreshTokenKey, res.refresh_token);
          }
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap(() => this.checkKycStatus()),
        tap(({ verified }) => {
          console.log('Kiểm tra KYC sau đăng nhập:', verified);
          this.isKycVerifiedSubject.next(verified);
          this.router.navigate([verified ? '/dashboard' : '/kyc'], {
            queryParams: !verified ? { message: 'Vui lòng xác minh danh tính' } : {},
          });
        }),
        catchError((error) => {
          console.error('Lỗi đăng nhập hoặc kiểm tra KYC:', error);
          if (error.status === 401 || error.status === 403) {
            return throwError(() =>
              new Error('Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập hoặc mật khẩu.')
            );
          }
          this.router.navigate(['/kyc'], {
            queryParams: { message: 'Vui lòng xác minh danh tính' },
          });
          return throwError(() =>
            new Error('Không thể kiểm tra trạng thái KYC: ' + (error?.error?.message || error?.message || 'Lỗi không xác định'))
          );
        })
      );
  }

  checkKycStatus(): Observable<{ verified: boolean }> {
    console.log('Checking KYC status...');
    return this.http.get<{ verified: boolean }>(`${this.apiUrl}/status`).pipe(
      tap((res) => {
        console.log('KYC Status Response:', res);
        this.isKycVerifiedSubject.next(res.verified);
      }),
      catchError((error) => {
        console.error('KYC Status Check Error:', error?.message);
        return throwError(() => new Error('Không thể kiểm tra trạng thái KYC: ' + error?.error?.message || error?.message || 'Unknown error'));
      })
    );
  }

  verifyKyc(kycData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/kyc/verify`, kycData).pipe(
      tap((res: any) => {
        if (res.isVerified) this.isKycVerifiedSubject.next(true);
      }),
      catchError((error) =>
        throwError(() => new Error('Xác minh KYC thất bại: ' + error?.error?.message || error?.message || 'Unknown error'))
      )
    );
  }

  getCustomerList(): Observable<any> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Bạn không có quyền truy cập danh sách khách hàng'));
    }
    return this.http.get(`${this.apiUrl}/list`).pipe(
      tap((res) => console.log('Customer List:', res)),
      catchError((error) =>
        throwError(() => new Error('Lấy danh sách khách hàng thất bại: ' + (error.error?.message || 'Lỗi không xác định')))
      )
    );
  }

  getCustomerDetail(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/detail`).pipe(
      tap((res) => console.log('Customer Detail:', res)),
      catchError((error) =>
        throwError(() => new Error('Lấy thông tin khách hàng thất bại: ' + (error.error?.message || 'Lỗi không xác định')))
      )
    );
  }

  updateCustomer(customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, customerData).pipe(
      tap((res) => console.log('Update Customer Response:', res)),
      catchError((error) =>
        throwError(() => new Error('Cập nhật thông tin khách hàng thất bại: ' + (error.error?.message || 'Lỗi không xác định')))
      )
    );
  }

  updateCustomerStatus(statusData: any): Observable<any> {
    if (!this.checkAdminAccess()) {
      return throwError(() => new Error('Bạn không có quyền cập nhật trạng thái khách hàng'));
    }
    return this.http.put(`${this.apiUrl}/status`, statusData).pipe(
      tap((res) => console.log('Update Customer Status Response:', res)),
      catchError((error) =>
        throwError(() => new Error('Cập nhật trạng thái khách hàng thất bại: ' + (error.error?.message || 'Lỗi không xác định')))
      )
    );
  }

  getCustomerAccounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/accounts`).pipe(
      tap((res) => console.log('Customer Accounts:', res)),
      catchError((error) =>
        throwError(() => new Error('Lấy danh sách tài khoản thất bại: ' + (error.error?.message || 'Lỗi không xác định')))
      )
    );
  }

  refreshToken(): Observable<TokenResponse> {
    // Nếu đã có một refresh token request đang chạy, trả về Observable từ Promise đó
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
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('refresh_token', refreshToken);

    const refreshRequest = this.http
      .post<TokenResponse>(this.keycloakUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((res: TokenResponse) => {
          console.log('Refresh token thành công');
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.tokenKey, res.access_token);
            localStorage.setItem(this.refreshTokenKey, res.refresh_token);
          }
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

  private handleSessionExpired(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.isAuthenticatedSubject.next(false);
    this.isKycVerifiedSubject.next(false);
    
    Swal.fire({
      title: 'Phiên đăng nhập hết hạn',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Đăng nhập lại',
      allowOutsideClick: false
    }).then(() => {
      this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.isAuthenticatedSubject.next(false);
    this.isKycVerifiedSubject.next(false);
    
    Swal.fire({
      title: 'Đăng xuất thành công',
      text: 'Hẹn gặp lại bạn!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/login']).then(() => {
        location.reload();
      });
    });
  }

  async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) {
      console.warn('Không có token, chuyển hướng đến trang đăng nhập');
      this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      return null;
    }

    // Nếu token đã hết hạn hoặc sắp hết hạn, làm mới token
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

    // Nếu token còn hợp lệ, trả về token hiện tại
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
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.tokenKey) : null;
  }

  getRefreshToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.refreshTokenKey) : null;
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
      this.isAuthenticatedSubject.next(true);
    }
  }

  hasTokenSync(): boolean {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem(this.tokenKey) : null;
    return token ? !this.isTokenExpired(token) : false;
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  isKycVerified(): Observable<boolean> {
    return this.isKycVerifiedSubject.asObservable();
  }

  getKycVerifiedValue(): boolean {
    return this.isKycVerifiedSubject.getValue();
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  resendVerificationCode(email: string): Observable<any> {
    console.log(this.apiUrl)
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError((error) =>
        throwError(() => new Error('Gửi lại mã OTP thất bại: ' + error.error.message))
      )
    );

  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword, confirmPassword }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đặt lại mật khẩu thất bại: ' + error.error.message))
      )
    );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, { currentPassword, newPassword, confirmPassword }).pipe(
      catchError((error) =>
        throwError(() => new Error('Đổi mật khẩu thất bại: ' + error.error.message))
      )
    );
  }
}
