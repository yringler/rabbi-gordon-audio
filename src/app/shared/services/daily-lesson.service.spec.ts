import { TestBed } from '@angular/core/testing';

import { DailyLessonService } from './daily-lesson.service';
import { LessonFileService } from './lesson-file.service';

describe('DailyLessonService', () => {
	beforeEach(() => {
		var mockFile = jasmine.createSpyObj('LessonFile', ['readText', 'writeText', 'remove']);
		mockFile.readText.and.returnValue(Promise.resolve());
		mockFile.writeText.and.returnValue(Promise.resolve());
		mockFile.remove.and.returnValue(Promise.resolve());

		var mockFileService = jasmine.createSpyObj('LessonFileService', ['get']);
		mockFileService.get.returnValue(mockFile);

		TestBed.configureTestingModule({
			providers: [
				DailyLessonService,
				{ provide: LessonFileService, useValue: mockFileService }
			]
		})
	});

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
