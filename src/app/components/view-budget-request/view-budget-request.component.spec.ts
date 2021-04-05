import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBudgetRequestComponent } from './view-budget-request.component';

describe('ViewBudgetRequestComponent', () => {
  let component: ViewBudgetRequestComponent;
  let fixture: ComponentFixture<ViewBudgetRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBudgetRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBudgetRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
