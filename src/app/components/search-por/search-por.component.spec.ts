import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPorComponent } from './search-por.component';

describe('SearchPorComponent', () => {
  let component: SearchPorComponent;
  let fixture: ComponentFixture<SearchPorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
