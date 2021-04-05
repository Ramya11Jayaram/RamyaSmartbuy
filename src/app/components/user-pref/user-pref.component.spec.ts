import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrefComponent } from './user-pref.component';

describe('UserPrefComponent', () => {
  let component: UserPrefComponent;
  let fixture: ComponentFixture<UserPrefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPrefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
