import { TestBed } from '@angular/core/testing';

import { ReprocessService } from './reprocess.service';

describe('ReprocessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReprocessService = TestBed.get(ReprocessService);
    expect(service).toBeTruthy();
  });
});
