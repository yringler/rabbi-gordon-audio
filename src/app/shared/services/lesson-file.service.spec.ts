import { TestBed } from '@angular/core/testing';

import { LessonFileService } from './lesson-file.service';

describe('LessonFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonFileService = TestBed.get(LessonFileService);
    expect(service).toBeTruthy();
  });
});
