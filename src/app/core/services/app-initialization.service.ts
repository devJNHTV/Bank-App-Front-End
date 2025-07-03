import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, timeout, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private initializationCompleteSubject = new BehaviorSubject<boolean>(false);
  public initializationComplete$ = this.initializationCompleteSubject.asObservable();
  private initializationPromise: Promise<void> | null = null;

  constructor(private authService: AuthService) {
    // Tự động initialize khi service được tạo
    this.initializeOnStartup();
  }

  private async initializeOnStartup(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    return this.initializationPromise;
  }

  async initialize(): Promise<void> {
    console.log('Bắt đầu khởi tạo ứng dụng');
    
    try {
      const token = this.authService.getToken();

      if (token && (this.authService.isTokenExpiringSoon(token, 30) || this.authService.isTokenExpired(token))) {
        console.log('Token cần refresh, đang thực hiện...');
        
        // Thêm timeout để tránh hang
        const tokenResponse = await firstValueFrom(
          this.authService.refreshToken().pipe(
            timeout(10000), // 10s timeout
            catchError(error => {
              console.error('Refresh token timeout hoặc lỗi:', error);
              throw error;
            })
          )
        );
        
        console.log('Token refresh thành công');
        this.authService.saveToken(tokenResponse.access_token);
        this.authService.saveRefreshToken(tokenResponse.refresh_token);
        
      } else if (token && !this.authService.isTokenExpired(token)) {
        console.log('Token hợp lệ, khởi tạo auth state');
        this.authService.initializeAuthState();
      } else {
        console.log('Không có token hợp lệ');
      }
      
      this.initializationCompleteSubject.next(true);
      console.log('Khởi tạo ứng dụng thành công');
      
    } catch (error) {
      console.error('Khởi tạo ứng dụng thất bại:', error);
      // Không logout ngay, để user có cơ hội retry
      this.initializationCompleteSubject.next(true);
    }
  }

  isInitializationComplete(): boolean {
    return this.initializationCompleteSubject.value;
  }

  // Method để retry initialization nếu cần
  async retryInitialization(): Promise<void> {
    this.initializationCompleteSubject.next(false);
    this.initializationPromise = null;
    return this.initialize();
  }
}