import { TestBed } from '@angular/core/testing';

import { AllowedFilesService } from './allowed-files.service';

describe('AllowedFilesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AllowedFilesService = TestBed.get(AllowedFilesService);
    expect(service).toBeTruthy();
  });
});
