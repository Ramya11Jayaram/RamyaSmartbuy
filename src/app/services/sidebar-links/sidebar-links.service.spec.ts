import { TestBed } from '@angular/core/testing';

import { SidebarLinksService } from './sidebar-links.service';

describe('SidebarLinksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidebarLinksService = TestBed.get(SidebarLinksService);
    expect(service).toBeTruthy();
  });
});
