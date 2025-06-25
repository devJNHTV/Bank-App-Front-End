import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, from, throwError } from 'rxjs';
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

  // Kiểm tra URL có trong danh sách bỏ qua không
  if (ignoredUrls.some(url => req.url.includes(url))) {
    console.log('Bỏ qua bộ chặn xác thực cho URL:', req.url);
    return next(req);
  }

  const token = authService.getToken();

  // Nếu không có token, gửi request không có Authorization header
  if (!token) {
    return next(req);
  }

  console.log('Auth interceptor processing request:', req.url);
  console.log('Current token exists, checking expiry...');

  const addAuthHeader = (request: HttpRequest<unknown>, authToken: string) => {
    console.log('Adding auth header with token');
    return request.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` },
    });
  };

  // Kiểm tra token có hết hạn không
  const isExpired = authService.isTokenExpired(token);
  const isExpiringSoon = authService.isTokenExpiringSoon(token, 30);

  console.log('Token status:', { isExpired, isExpiringSoon });

  // Nếu token đã hết hạn hoặc sắp hết hạn, refresh trước
  if (isExpired || isExpiringSoon) {
    console.log('Token cần làm mới, đang làm mới!');
    return from(authService.refreshToken()).pipe(
      switchMap((refreshResponse) => {
        console.log('Refresh token thành công');
        const newAuthReq = addAuthHeader(req, refreshResponse.access_token);
        return next(newAuthReq);
      }),
      catchError((refreshError: HttpErrorResponse) => {
        // Xử lý lỗi invalid_grant (refresh token không hợp lệ)
        if (refreshError?.error?.error === 'invalid_grant') {
          console.log('Refresh token không hợp lệ, phiên đã hết hạn');
          authService.handleSessionExpired('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          return EMPTY;
        }
        return throwError(() => refreshError);
      })
    );
  }

  // Token còn hợp lệ, gửi request bình thường
  console.log('Token valid, tiếp tục với current token');
  const authReq = addAuthHeader(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Yêu cầu không thành công với trạng thái:', error.status);
      
      if (error.status === 401) {
        console.log('401 error, attempting token refresh as fallback');
        
        // Thử refresh token một lần nữa khi gặp 401
        return from(authService.refreshToken()).pipe(
          switchMap((refreshResponse) => {
            console.log('Fallback token refresh successful');
            const newAuthReq = addAuthHeader(req, refreshResponse.access_token);
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            console.error('Fallback token refresh failed:', refreshError);
            authService.handleSessionExpired('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return throwError(() => new Error('Session expired'));
          })
        );
      }
      
      console.error('Non-401 HTTP Error:', error?.error?.message || error?.message || 'Unknown error');
      return throwError(() => error);
    })
  );
};