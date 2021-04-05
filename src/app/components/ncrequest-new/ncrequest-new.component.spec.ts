import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NcrequestNewComponent } from './ncrequest-new.component';

describe('NcrequestNewComponent', () => {
  let component: NcrequestNewComponent;
  let fixture: ComponentFixture<NcrequestNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NcrequestNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NcrequestNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
