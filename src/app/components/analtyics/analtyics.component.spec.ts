import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaltyicsComponent } from './analtyics.component';

describe('AnaltyicsComponent', () => {
  let component: AnaltyicsComponent;
  let fixture: ComponentFixture<AnaltyicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnaltyicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaltyicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
