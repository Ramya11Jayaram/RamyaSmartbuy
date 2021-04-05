import { TestBed } from '@angular/core/testing';

import { PODetailsService } from './podetails.service';

describe('PODetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PODetailsService = TestBed.get(PODetailsService);
    expect(service).toBeTruthy();
  });
});
