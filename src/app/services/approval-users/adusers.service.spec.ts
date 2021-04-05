import { TestBed } from '@angular/core/testing';

import { AdusersService } from './adusers.service';

describe('AdusersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdusersService = TestBed.get(AdusersService);
    expect(service).toBeTruthy();
  });
});
