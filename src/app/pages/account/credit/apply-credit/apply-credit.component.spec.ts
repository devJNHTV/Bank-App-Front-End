import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyCreditComponent } from './apply-credit.component';

describe('ApplyCreditComponent', () => {
  let component: ApplyCreditComponent;
  let fixture: ComponentFixture<ApplyCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyCreditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
