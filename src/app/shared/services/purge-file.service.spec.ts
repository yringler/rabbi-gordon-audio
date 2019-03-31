import { TestBed } from '@angular/core/testing';

import { PurgeFileService } from './purge-file.service';

describe('PurgeFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PurgeFileService = TestBed.get(PurgeFileService);
    expect(service).toBeTruthy();
  });
});
