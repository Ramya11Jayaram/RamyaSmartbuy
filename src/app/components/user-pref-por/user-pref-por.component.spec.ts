import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrefPorComponent } from './user-pref-por.component';

describe('UserPrefPorComponent', () => {
  let component: UserPrefPorComponent;
  let fixture: ComponentFixture<UserPrefPorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPrefPorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPrefPorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
