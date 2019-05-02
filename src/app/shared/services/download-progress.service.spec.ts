import { TestBed } from '@angular/core/testing';

import { DownloadProgressService } from './download-progress.service';

describe('DownloadProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DownloadProgressService = TestBed.get(DownloadProgressService);
    expect(service).toBeTruthy();
  });
});
