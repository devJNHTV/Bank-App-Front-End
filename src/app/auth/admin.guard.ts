// import { inject } from '@angular/core';
// import { Router } from '@angular/router';

// export const adminGuard = () => {
//   const router = inject(Router);
  
//   const token = localStorage.getItem('auth_token');
//   if (!token) {
//     router.navigate(['/auth/login']);
//     return false;
//   }

//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     if (!payload.roles || !payload.roles.includes('ADMIN')) {
//       router.navigate(['/customer/profile']);
//       return false;
//     }
//     return true;
//   } catch {
//     router.navigate(['/auth/login']);
//     return false;
//   }
// }; 