import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCreditComponent } from './register-credit.component';

describe('RegisterCreditComponent', () => {
  let component: RegisterCreditComponent;
  let fixture: ComponentFixture<RegisterCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
