import { TestBed } from '@angular/core/testing';

import { ErrorTranslationService } from './error-translation.service';

describe('ErrorTranslationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ErrorTranslationService = TestBed.get(ErrorTranslationService);
    expect(service).toBeTruthy();
  });
});
