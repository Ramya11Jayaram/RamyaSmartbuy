import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPorComponent } from './display-por.component';

describe('DisplayPorComponent', () => {
  let component: DisplayPorComponent;
  let fixture: ComponentFixture<DisplayPorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayPorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayPorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
