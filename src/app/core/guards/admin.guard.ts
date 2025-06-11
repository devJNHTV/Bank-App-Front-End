import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    this.authService.initializeAuthState(); // Khởi tạo trạng thái xác thực
    return combineLatest([
      this.authService.isAuthenticated(),
      this.adminService.isAdmin(),
    ]).pipe(
      take(1),
      map(([isAuthenticated, isAdmin]) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        if (!isAdmin) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}