import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KycGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Luôn gọi API để kiểm tra trạng thái KYC mới nhất
    return this.authService.checkKycStatus().pipe(
      map(({ verified }) => {
        if (!verified) {
          this.router.navigate(['/kyc']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/kyc']);
        return of(false);
      })
    );
  }
}
