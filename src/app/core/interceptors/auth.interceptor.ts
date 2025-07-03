import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { inject, Injector } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

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
    console.log('Không có token, tiếp tục yêu cầu mà không có header Authorization');
    return next(req);
  }

  console.log('Auth interceptor processing request:', req.url);
  console.log('Current token exists, checking authentication status...');

  const addAuthHeader = (request: HttpRequest<unknown>, authToken: string) => {
    console.log('Adding auth header with token');
    return request.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` },
    });
  };

  // Kiểm tra trạng thái xác thực từ isAuthenticatedSubject
  return from(firstValueFrom(authService.isAuthenticated())).pipe(
    switchMap((isAuthenticated) => {
      console.log('Trạng thái xác thực:', isAuthenticated);

      // Nếu đã xác thực và token còn hợp lệ, sử dụng token hiện tại
      if (isAuthenticated && !authService.isTokenExpired(token) && !authService.isTokenExpiringSoon(token, 120)) {
        console.log('Token hợp lệ và trạng thái xác thực là true, tiếp tục với token hiện tại');
        const authReq = addAuthHeader(req, token);
        return next(authReq);
      }

      // Nếu token hết hạn hoặc sắp hết hạn, hoặc trạng thái xác thực không hợp lệ, làm mới token
      console.log('Token cần làm mới hoặc trạng thái xác thực không hợp lệ, đang làm mới!');
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
    }),
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