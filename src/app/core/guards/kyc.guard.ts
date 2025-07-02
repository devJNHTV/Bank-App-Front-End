import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { KycService } from '../services/kyc.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class KycGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private kycService: KycService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Khởi tạo trạng thái xác thực
    this.authService.initializeAuthState();

    return this.authService.isAuthenticated().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return of(false);
        }

        return this.kycService.checkKycStatus().pipe(
          take(1),
          map(({ verified }) => {
            if (!verified) {
              Swal.fire({
                title: 'Xác minh danh tính',
                text: 'Tài khoản của bạn chưa được xác minh KYC. Bạn nên xác minh để đảm bảo quyền lợi và bảo mật.',
                icon: 'info',
                confirmButtonText: 'Đã hiểu'
              });
            }
            return true;
          }),
          catchError(error => {
            console.error('Lỗi kiểm tra KYC:', error);
            return of(true);
          })
        );
      }),
      catchError(error => {
        console.error('Lỗi xác thực người dùng:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
