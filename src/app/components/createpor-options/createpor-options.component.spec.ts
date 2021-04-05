import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateporOptionsComponent } from './createpor-options.component';

describe('CreateporOptionsComponent', () => {
  let component: CreateporOptionsComponent;
  let fixture: ComponentFixture<CreateporOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateporOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateporOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
