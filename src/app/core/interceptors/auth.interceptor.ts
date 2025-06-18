import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, retry } from 'rxjs/operators';
import { inject, Injector } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const injector = inject(Injector);
  const authService = injector.get(AuthService);

  const ignoredUrls = [
    '/protocol/openid-connect/token',
    '/login',
    '/register',
  ];

  if (ignoredUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const addAuthHeader = (request: HttpRequest<unknown>, token: string) =>
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

  const handle401Error = (request: HttpRequest<unknown>, error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
    return from(authService.refreshToken()).pipe(
      retry({ count: 2, delay: 1000 }),
      switchMap((res) => {
        const newAuthReq = addAuthHeader(request, res.access_token);
        return next(newAuthReq);
      }),
      catchError((refreshError) => {
        console.error('Lỗi khi refresh token sau nhiều lần thử:', refreshError);
        Swal.fire({
          title: 'Phiên đăng nhập hết hạn',
          text: 'Vui lòng đăng nhập lại.',
          icon: 'warning',
          confirmButtonText: 'Đăng nhập lại',
          allowOutsideClick: false,
        }).then(() => {
          authService.logout();
        });
        return throwError(() => refreshError);
      })
    );
  };

  if (authService.isTokenExpired(token) || authService.isTokenExpiringSoon(token, 30)) {
    return from(authService.refreshToken()).pipe(
      retry({ count: 2, delay: 1000 }),
      switchMap((res) => {
        const authReq = addAuthHeader(req, res.access_token);
        return next(authReq);
      }),
      catchError((error) => handle401Error(req, error))
    );
  }

  const authReq = addAuthHeader(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, error);
      }
      console.error('Lỗi HTTP:', error?.error?.message || error?.message || 'Unknown error');
      return throwError(() => error);
    })
  );
};