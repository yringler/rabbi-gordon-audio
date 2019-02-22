import { TestBed } from '@angular/core/testing';

import { DailyLessonServiceService } from './daily-lesson-service.service';

describe('DailyLessonServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DailyLessonServiceService = TestBed.get(DailyLessonServiceService);
    expect(service).toBeTruthy();
  });
});
