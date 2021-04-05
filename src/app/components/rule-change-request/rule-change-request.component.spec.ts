import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleChangeRequestComponent } from './rule-change-request.component';

describe('RuleChangeRequestComponent', () => {
  let component: RuleChangeRequestComponent;
  let fixture: ComponentFixture<RuleChangeRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleChangeRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
