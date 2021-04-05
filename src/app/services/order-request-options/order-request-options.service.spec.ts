import { TestBed } from '@angular/core/testing';

import { OrderRequestOptionsService } from './order-request-options.service';

describe('OrderRequestOptionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderRequestOptionsService = TestBed.get(OrderRequestOptionsService);
    expect(service).toBeTruthy();
  });
});
