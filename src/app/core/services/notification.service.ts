import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  showSuccess(message: string, title: string = 'Thành công'): Promise<any> {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  showError(message: string, title: string = 'Lỗi'): Promise<any> {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  showWarning(message: string, title: string = 'Cảnh báo'): Promise<any> {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
    });
  }
}