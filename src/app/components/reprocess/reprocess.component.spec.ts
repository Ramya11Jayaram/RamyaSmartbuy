import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReprocessComponent } from './reprocess.component';

describe('ReprocessComponent', () => {
  let component: ReprocessComponent;
  let fixture: ComponentFixture<ReprocessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReprocessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
