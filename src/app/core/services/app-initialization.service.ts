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
      // Gọi initializeAuthState
      await this.authService.initializeAuthState();
      
      this.initializationCompleteSubject.next(true);
      console.log('Khởi tạo ứng dụng thành công');
      
    } catch (error) {
      console.error('Khởi tạo ứng dụng thất bại:', error);
      // Vẫn cho phép app khởi động để user có thể login
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