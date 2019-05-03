import { TestBed } from '@angular/core/testing';

import { NetworkPermissionService } from './network-permission.service';

describe('NetworkPermissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NetworkPermissionService = TestBed.get(NetworkPermissionService);
    expect(service).toBeTruthy();
  });
});
