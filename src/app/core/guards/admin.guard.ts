import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, timeout } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';
import Swal from 'sweetalert2';
import { AppInitializationService } from '../services/app-initialization.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private appInitService: AppInitializationService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.appInitService.initializationComplete$.pipe(
      filter(complete => complete),
      take(1),
      timeout(10000),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      }),
      switchMap(() => {
        this.authService.initializeAuthState(); 
        this.adminService.restoreAdminState(); 
        return combineLatest([
          this.authService.isAuthenticated(),
          this.adminService.isAdmin(),
        ]).pipe(
          take(1),
          timeout(5000),
          catchError(() => {
            this.router.navigate(['/login']);
            return of([false, false]);
          }),
          map(([isAuthenticated, isAdmin]) => {
            if (!isAuthenticated) {
              this.router.navigate(['/login']);
              return false;
            }
            if (!isAdmin) {
              Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Bạn không có quyền truy cập',
              }).then(() => {
                this.router.navigate(['/customer-dashboard']);
              });
              return false;
            }
            return true;
          })
        );
      })
    );
  }
}