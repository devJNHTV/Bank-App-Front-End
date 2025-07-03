import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { MY_DATE_FORMATS } from '../../shared/date-formats';
import Swal from 'sweetalert2';
import { RegistrationService } from '../../core/services/registration.service';
import Tesseract from 'tesseract.js';
import { StepperRegisterComponent } from '../stepper-register.component';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    StepperRegisterComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
  ],
  templateUrl: './kyc-otp.component.html',
  styleUrl: './kyc-otp.component.scss',
})
export class KycOtpComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  kycForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  email: string | null = null;
  uploadedImage: string | null = null;
  isProcessingImage = false;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<any>
  ) {
    this.kycForm = this.fb.group({
      identityNumber: ['123123126666', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      fullName: ['test frontend', Validators.required],
      dateOfBirth: [new Date(2002, 5, 22), Validators.required],
      gender: ['male', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'];
      if (!this.email) {
        this.errorMessage = 'Email không hợp lệ. Vui lòng quay lại bước đăng ký.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          timer: 3000,
        }).then(() => {
          this.router.navigate(['/register']);
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Thông báo',
          text: 'Vui lòng xác minh thông tin đăng ký!',
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.isProcessingImage = true;
      this.errorMessage = null;

      const reader = new FileReader();

      reader.onload = async (e: any) => {
        this.uploadedImage = e.target.result;
        try {
          await this.tryOCRExtraction(e.target.result);
        } catch (error) {
          console.error('Error processing image:', error);
          this.isProcessingImage = false;
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xử lý ảnh. Vui lòng thử lại!',
            timer: 3000,
          });
        }
      };

      reader.onerror = () => {
        this.isProcessingImage = false;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể đọc file ảnh!',
          timer: 3000,
        });
      };

      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng chọn file ảnh hợp lệ (JPG, PNG, v.v.)!',
        timer: 3000,
      });
    }
  }

  async tryOCRExtraction(imageSrc: string): Promise<void> {
    try {
      console.log('Bắt đầu trích xuất OCR...');

      Swal.fire({
        icon: 'info',
        title: 'Đang xử lý',
        text: 'Đang nhận dạng văn bản từ ảnh...',
        timer: 2000,
        timerProgressBar: true,
      });

      const { data: { text } } = await Tesseract.recognize(imageSrc, 'vie+eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`Tiến độ OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('Kết quả OCR:', text);
      this.extractDataFromOCR(text);

    } catch (error) {
      console.error('Trích xuất OCR thất bại:', error);
      this.isProcessingImage = false;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Không thể nhận dạng thông tin. Vui lòng nhập thủ công hoặc thử ảnh khác!',
        timer: 3000,
      });
    }
  }

  extractDataFromOCR(text: string): void {
  const formData: any = {};
  let hasValidData = false;

  console.log('Full OCR text:', text);

  // Trích xuất số CCCD
  const idMatches = text.match(/\b\d{12}\b/g);
  if (idMatches && idMatches.length > 0) {
    formData.identityNumber = idMatches[0];
    hasValidData = true;
  }

  // Trích xuất họ tên - Cải thiện logic
  const nameMatch = text.match(/(?:Họ tên|Họ và tên)\s*[:\s]*(.*?)(?:\n|$)/i);
  if (nameMatch && nameMatch[1]) {
    let name = nameMatch[1].trim();
    console.log('Raw name from regex:', name);
    
    // Chỉ loại bỏ các ký tự đặc biệt, GIỮ LẠI chữ, số và khoảng trắng
    name = name.replace(/[^\p{L}\d\s]/gu, '').trim();
    console.log('Name after cleaning special chars:', name);
    
    // Tách các từ nhưng KHÔNG lọc số
    const nameParts = name.split(/\s+/).filter(part => {
      // Cho phép cả chữ và số, chỉ loại bỏ chuỗi rỗng
      return part.length > 0;
    });
    
    if (nameParts.length > 0) {
      formData.fullName = nameParts.join(' ');
      hasValidData = true;
      console.log('Final extracted name:', formData.fullName);
    }
  } else {
    // Dự phòng: tìm dòng có thể là tên
    const lines = text.split('\n').map(l => l.trim());
    const invalidWords = ['SINH', 'NGÀY', 'NAM', 'NỮ', 'VIỆT', 'CỘNG', 'HÒA', 'QUỐC', 'TỊCH', 'DÂN', 'TỘC', 'GIẤY', 'TỜ', 'TÙY', 'THÂN'];
    
    for (const line of lines) {
      console.log('Checking line:', line);
      
      if (line.length > 2 && line.length < 100) {
        // Kiểm tra xem dòng có chứa từ không hợp lệ không
        const upperLine = line.toUpperCase();
        const hasInvalidWord = invalidWords.some(w => upperLine.includes(w));
        
        if (!hasInvalidWord) {
          // Chỉ loại bỏ ký tự đặc biệt, GIỮ LẠI chữ, số và khoảng trắng
          const cleanLine = line.replace(/[^\p{L}\d\s]/gu, '').trim();
          console.log('Clean line for name check:', cleanLine);
          
          if (cleanLine.length > 2) {
            const nameParts = cleanLine.split(/\s+/).filter(part => 
              part.length > 0  // Chỉ loại bỏ chuỗi rỗng, GIỮ LẠI tất cả chữ và số
            );
            
            // Kiểm tra xem có phải là tên hợp lệ không
            if (nameParts.length > 0 && nameParts.length <= 10) {
              formData.fullName = nameParts.join(' ');
              hasValidData = true;
              console.log('Fallback extracted name:', formData.fullName);
              break;
            }
          }
        }
      }
    }
  }

  // Trích xuất ngày sinh
  const datePatterns = [
    /\b(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4})\b/g,
    /(?:sinh|ngày sinh)\s*[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{4})/i,
    /\b(\d{1,2}\s+\d{1,2}\s+\d{4})\b/g
  ];

  for (const pattern of datePatterns) {
    const dateMatches = text.match(pattern);
    if (dateMatches) {
      for (let dateMatch of dateMatches) {
        dateMatch = dateMatch.replace(/(sinh|ngày sinh)\s*[:\s]*/i, '');
        const dateStr = dateMatch.replace(/\./g, '/').replace(/-/g, '/').replace(/\s+/g, '/');
        const date = this.parseDateString(dateStr);
        if (date && date.getFullYear() > 1900 && date.getFullYear() < 2025) {
          formData.dateOfBirth = date;
          hasValidData = true;
          break;
        }
      }
      if (formData.dateOfBirth) break;
    }
  }

  // Trích xuất giới tính
  const genderMatch = text.match(/Giới tính\s*[:\s]*(Nam|Nữ)/i);
    if (genderMatch && genderMatch[1]) {
      formData.gender = this.parseGender(genderMatch[1]);
      hasValidData = true;
    }

  console.log('Dữ liệu OCR trích xuất:', formData);

  this.isProcessingImage = false;

  if (hasValidData) {
    this.kycForm.patchValue(formData);
    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: 'Đã trích xuất thông tin từ hình ảnh!',
      timer: 3000,
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Cảnh báo',
      text: 'Không thể nhận dạng thông tin. Vui lòng nhập thủ công hoặc thử ảnh khác!',
      timer: 3000,
    });
  }
}

  parseDateString(dateStr: string): Date | null {
    try {
      console.log('Phân tích chuỗi ngày:', dateStr);

      const cleanDate = dateStr.replace(/[^\d\/]/g, '');
      const parts = cleanDate.split('/');

      if (parts.length === 3) {
        let day: number, month: number, year: number;

        // Thử format dd/mm/yyyy
        if (parts[2].length === 4) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          year = parseInt(parts[2]);
        } 
        // Thử format yyyy/mm/dd
        else if (parts[0].length === 4) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]);
          day = parseInt(parts[2]);
        } else {
          return null;
        }

        // Kiểm tra phạm vi ngày
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2025) {
          const date = new Date(year, month - 1, day);

          // Kiểm tra tính hợp lệ của ngày
          if (date.getFullYear() === year && 
              date.getMonth() === month - 1 && 
              date.getDate() === day) {
            console.log('Ngày đã phân tích:', date);
            return date;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Lỗi phân tích ngày:', error);
      return null;
    }
  }

  parseGender(genderStr: string): string {
    const gender = genderStr.toLowerCase().trim();
    console.log('Phân tích giới tính:', gender);

    if (gender.includes('nam') || gender.includes('male') || gender === '1') {
      return 'male';
    } else if (gender.includes('nữ') || gender.includes('female') || gender === '0') {
      return 'female';
    }
    return '';
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  clearImage(): void {
    this.uploadedImage = null;
    this.isProcessingImage = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.kycForm.invalid || !this.email) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const rawDate = this.kycForm.get('dateOfBirth')?.value;
    let formattedDate: string | null = null;

    if (rawDate instanceof Date) {
      formattedDate = this.dateAdapter.format(rawDate, { dateInput: 'YYYY-MM-DD' });
    } else if (typeof rawDate === 'string') {
      formattedDate = rawDate;
    } else {
      this.isLoading = false;
      this.errorMessage = 'Ngày sinh không hợp lệ';
      return;
    }

    const kycData = {
      ...this.kycForm.value,
      dateOfBirth: formattedDate,
    };

    console.log('kycData:', kycData);

    this.registrationService.processKycAndSendOtp(this.email, kycData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Xác minh KYC thành công, mã OTP đã được gửi!',
          timer: 3000,
        }).then(() => {
          this.router.navigate(['/confirm-otp'], { queryParams: { email: this.email } });
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Xác minh KYC thất bại. Vui lòng thử lại.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage || undefined,
          timer: 3000,
        });
      },
    });
  }
}