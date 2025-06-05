import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper-container">
      <div class="stepper-steps">
        <div class="step-item" 
             [class.active]="currentStep >= 1" 
             [class.completed]="currentStep > 1">
          <div class="step-circle">1</div>
          <span class="step-label">Khởi tạo</span>
        </div>

        <div  [class.completed]="currentStep > 1" class="step-divider"></div>

        <div class="step-item" 
             [class.active]="currentStep >= 2" 
             [class.completed]="currentStep > 2">
          <div class="step-circle">2</div>
          <span class="step-label">Xác nhận</span>
        </div>
        

        <div class="step-divider"></div>

        <div class="step-item" 
             [class.active]="currentStep >= 3" 
             [class.completed]="currentStep > 3">
          <div class="step-circle">3</div>
          <span class="step-label">Xác thực</span>
        </div>

        
        <div class="step-divider"></div>

        <div class="step-item" 
             [class.active]="currentStep >= 4" 
             [class.completed]="currentStep > 4">
          <div class="step-circle">4</div>
          <span class="step-label">Hoàn thành</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stepper-container {
      padding: 20px 0;
      width: 100%;
    }
    
    .stepper-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #6c757d;
      flex-shrink: 0;
    }
    
    .step-item.active {
      color: #007ad9;
    }
    
    .step-item.completed {
      color: #28a745;
    }
    
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      background: white;
      margin-bottom: 8px;
    }
    
    .step-item.active .step-circle {
      border-color: #007ad9;
      background: #007ad9;
      color: white;
    }
    
    .step-item.completed .step-circle {
      border-color: #28a745;
      background: #28a745;
      color: white;
    }
    
    .step-divider {
      flex: 1;
      height: 2px;
      background: #e9ecef;
      margin: 0 20px;
      max-width: 100px;
    }
    .step-divider.completed {
  background-color: green; /* Khi có class 'completed' → đổi màu */
}
    .step-item.active ~ .step-item .step-divider {
      background: #007ad9;
    }
    
    .step-label {
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
    }
    
    @media (max-width: 768px) {
      .step-label {
        font-size: 12px;
      }
      
      .step-divider {
        margin: 0 10px;
        max-width: 50px;
      }
      
      .step-circle {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .step-label {
        display: none;
      }
      
      .step-divider {
        margin: 0 15px;
        max-width: 30px;
      }
    }
  `]
})
export class StepperComponent {
  @Input() currentStep: number = 1;
} 