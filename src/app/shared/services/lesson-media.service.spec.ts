import { TestBed } from '@angular/core/testing';

import { LessonMediaService } from './lesson-media.service';

describe('LessonMediaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonMediaService = TestBed.get(LessonMediaService);
    expect(service).toBeTruthy();
  });
});
