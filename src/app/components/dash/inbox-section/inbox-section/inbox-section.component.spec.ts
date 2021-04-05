import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxSectionComponent } from './inbox-section.component';

describe('InboxSectionComponent', () => {
  let component: InboxSectionComponent;
  let fixture: ComponentFixture<InboxSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboxSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
