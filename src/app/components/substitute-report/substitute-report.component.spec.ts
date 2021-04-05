import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstituteReportComponent } from './substitute-report.component';

describe('SubstituteReportComponent', () => {
  let component: SubstituteReportComponent;
  let fixture: ComponentFixture<SubstituteReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubstituteReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubstituteReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
