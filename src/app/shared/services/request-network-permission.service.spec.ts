import { TestBed } from '@angular/core/testing';

import { RequestNetworkPermissionService } from './request-network-permission.service';

describe('RequestNetworkPermissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequestNetworkPermissionService = TestBed.get(RequestNetworkPermissionService);
    expect(service).toBeTruthy();
  });
});
