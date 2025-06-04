import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  if (authService.isTokenExpired(token)) {
    return from(authService.refreshToken()).pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        if (newToken) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(authReq);
        }
        return throwError(() => new Error('Không thể làm mới token'));
      }),
      catchError(() => {
        authService.logout();
        return throwError(() => new Error('Phiên đăng nhập hết hạn'));
      })
    );
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
