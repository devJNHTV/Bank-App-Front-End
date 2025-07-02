import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycManagerComponent } from './kyc-manager.component';

describe('KycManagerComponent', () => {
  let component: KycManagerComponent;
  let fixture: ComponentFixture<KycManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
