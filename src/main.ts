// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));


import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './app/core/services/auth.service';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    const injector = appRef.injector;
    const authService = injector.get(AuthService);

    const token = authService.getToken();

    if (token && authService.isTokenExpiringSoon(token, 30)) {
      firstValueFrom(authService.refreshToken())
        .then(() => console.log('✅ Token đã được làm mới'))
        .catch(error => {
          console.error('❌ Không thể refresh token', error);
          authService.logout();
        });
    }
  })
  .catch(err => console.error(err));

