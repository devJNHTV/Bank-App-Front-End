import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { KycService } from '../services/kyc.service';

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
    this.authService.initializeAuthState(); // Khởi tạo trạng thái xác thực
    return combineLatest([
      this.authService.isAuthenticated(),
      this.kycService.checkKycStatus(),
    ]).pipe(
      map(([isAuthenticated, { verified }]) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        if (!verified) {
          this.router.navigate(['/kyc'], {
            queryParams: { message: 'Vui lòng xác minh danh tính' },
          });
          return false;
        }
        return true;
        
      }),
      catchError((error) => {
        console.error('Lỗi kiểm tra KYC:', error);
        this.router.navigate(['/kyc'], {
          queryParams: { message: 'Vui lòng xác minh danh tính' },
        });
        return of(false);
      })
    );
  }
}