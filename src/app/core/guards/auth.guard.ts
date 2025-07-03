import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest, of, timer } from 'rxjs';
import { map, take, switchMap, filter, timeout, catchError } from 'rxjs/operators';
import { KycService } from '../services/kyc.service';
import { AppInitializationService } from '../services/app-initialization.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private kycService: KycService,
    private router: Router,
    private appInitService: AppInitializationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    console.log('Kiểm tra quyền truy cập');
    
    return this.appInitService.initializationComplete$.pipe(
      filter(complete => complete),
      take(1),
      timeout(15000), // 15s timeout cho initialization
      catchError(error => {
        console.error('Timeout hoặc lỗi initialization:', error);
        this.router.navigate(['/login']);
        return of(false);
      }),
      switchMap(() => {
        console.log('Hoàn tất khởi tạo ứng dụng, kiểm tra xác thực');
        
        return combineLatest([
          this.authService.isAuthenticated(),
          this.kycService.isKycVerified(),
        ]).pipe(
          take(1),
          timeout(5000), // 5s timeout cho auth check
          catchError(error => {
            console.error('Timeout hoặc lỗi auth check:', error);
            this.router.navigate(['/login']);
            return of([false, false]);
          }),
          map(([isAuthenticated, isKycVerified]) => {
            console.log('Auth state', { isAuthenticated, isKycVerified });
            return this.handleAuthResult(isAuthenticated, isKycVerified, route);
          })
        );
      })
    );
  }

  private handleAuthResult(isAuthenticated: boolean, isKycVerified: boolean, route: ActivatedRouteSnapshot): boolean {
    if (!isAuthenticated) {
      console.log('Chưa xác thực, chuyển hướng đến đăng nhập');
      this.router.navigate(['/login']);
      return false;
    }

    const requiresKyc = route.data?.['requiresKyc'] ?? false;
    if (requiresKyc && !isKycVerified) {
      console.log('Yêu cầu KYC nhưng chưa được xác minh, chuyển hướng đến KYC');
      this.router.navigate(['/kyc'], {
        queryParams: { message: 'Vui lòng xác minh danh tính' },
      });
      return false;
    }

    console.log('Đã cấp quyền truy cập');
    return true;
  }
}