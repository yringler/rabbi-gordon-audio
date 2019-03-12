import { TestBed } from '@angular/core/testing';

import { DailyLessonService } from './daily-lesson.service';

describe('DailyLessonServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
  }));

  it('should be created', () => {
    const service: DailyLessonService = TestBed.get(DailyLessonService);
    expect(service).toBeTruthy();
  });
});
