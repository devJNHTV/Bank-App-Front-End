import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  const ignoredUrls = [
    '/protocol/openid-connect/token',
    '/login',
    '/register',
  ];

  if (ignoredUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getToken();

  // Nếu không có token -> request tiếp
  if (!token) {
    return next(req);
  }

  // Nếu token đã hết hạn hoặc sắp hết hạn thì gọi refresh
  if (authService.isTokenExpired(token) || authService.isTokenExpiringSoon(token, 30)) {
    return from(authService.refreshToken()).pipe(
      switchMap((res) => {
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${res.access_token}` },
        });
        return next(authReq);
      }),
      catchError((error) => {
        console.error('Lỗi khi refresh token:', error);
        return throwError(() => error);
      })
    );
  }

  // Nếu token còn hiệu lực thì thêm vào header
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token không hợp lệ hoặc hết hạn
        return from(authService.refreshToken()).pipe(
          switchMap((res) => {
            const newAuthReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access_token}` },
            });
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            console.error('Lỗi khi refresh token:', refreshError);
            Swal.fire({
              title: 'Lỗi xác thực',
              text: 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.',
              icon: 'error',
              confirmButtonText: 'Đăng nhập lại'
            });
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
