import { TestBed } from '@angular/core/testing';

import { DailyLessonService } from './daily-lesson.service';

describe('DailyLessonService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: DailyLessonService = TestBed.get(DailyLessonService);
		expect(service).toBeTruthy();
	});

	it('should load from network', () => {
		const service: DailyLessonService = TestBed.get(DailyLessonService);

		service.getLibrary().subscribe(
			library => expect(library.tracks.length).toEqual(3)
		);
	});
});
