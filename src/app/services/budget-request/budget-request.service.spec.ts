import { TestBed } from '@angular/core/testing';

import { BudgetRequestService } from './budget-request.service';

describe('BudgetRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BudgetRequestService = TestBed.get(BudgetRequestService);
    expect(service).toBeTruthy();
  });
});
