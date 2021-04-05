import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetApproverRequestComponent } from './budget-approver-request.component';

describe('BudgetApproverRequestComponent', () => {
  let component: BudgetApproverRequestComponent;
  let fixture: ComponentFixture<BudgetApproverRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetApproverRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetApproverRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
