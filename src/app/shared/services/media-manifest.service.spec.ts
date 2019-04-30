import { TestBed } from '@angular/core/testing';

import { MediaManifestService } from './media-manifest.service';

describe('MediaManifestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediaManifestService = TestBed.get(MediaManifestService);
    expect(service).toBeTruthy();
  });
});
