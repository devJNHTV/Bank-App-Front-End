import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatisticComponent } from './account-statistic.component';

describe('AccountStatisticComponent', () => {
  let component: AccountStatisticComponent;
  let fixture: ComponentFixture<AccountStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatisticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
