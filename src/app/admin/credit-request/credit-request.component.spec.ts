import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRequestComponent } from './credit-request.component';

describe('CreditRequestComponent', () => {
  let component: CreditRequestComponent;
  let fixture: ComponentFixture<CreditRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
