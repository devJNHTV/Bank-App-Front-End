import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycComponent } from './kyc-otp.component';

describe('KycComponent', () => {
  let component: KycComponent;
  let fixture: ComponentFixture<KycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
