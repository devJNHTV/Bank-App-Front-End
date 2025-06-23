import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { KycService } from '../services/kyc.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private kycService: KycService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.authService.initializeAuthState(); // Khởi tạo trạng thái xác thực
    return combineLatest([
      this.authService.isAuthenticated(),
      this.kycService.isKycVerified(),
    ]).pipe(
      take(1),
      map(([isAuthenticated, isKycVerified]) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        const requiresKyc = route.data?.['requiresKyc'] ?? false;
        if (requiresKyc && !isKycVerified) {
          this.router.navigate(['/kyc'], {
            queryParams: { message: 'Vui lòng xác minh danh tính' },
          });
          return false;
        }
        return true;
      })
    );
  }
}