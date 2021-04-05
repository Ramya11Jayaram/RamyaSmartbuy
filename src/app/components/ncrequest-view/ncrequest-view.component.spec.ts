import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NcrequestViewComponent } from './ncrequest-view.component';

describe('NcrequestViewComponent', () => {
  let component: NcrequestViewComponent;
  let fixture: ComponentFixture<NcrequestViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NcrequestViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NcrequestViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
