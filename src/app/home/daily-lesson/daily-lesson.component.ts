import { Component, OnInit, Input } from '@angular/core';
import { DailyLessonTrack, Lesson } from '~/app/shared/models/dailyLessons';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { LessonMediaService } from '~/app/shared/services/lesson-media.service';

@Component({
	selector: 'daily-lesson',
	templateUrl: './daily-lesson.component.html',
	styleUrls: ['./daily-lesson.component.css'],
	moduleId: module.id,
})
export class DailyLessonComponent implements OnInit {
	/**
	 * @description When lesson is tapped, we want to load future lessons. But I prefer
	 * not to run all the observables etc. if we already did.
	 * There seems to be no way to detach an event in angular, so maintain state here.
	 */
	private preLoadedFutureLessons;

	constructor(
		private player: MediaPlayerService,
		private lessonMediaService: LessonMediaService) { }

	@Input() track: DailyLessonTrack;

	/**
	 * @description The name of the file which contains this lesson.
	 */
	fileName: string;

	get lesson(): Lesson {
		return this.track.days[0];
	}

	ngOnInit() {
		this.lessonMediaService.getFilesForLesson(this.lesson)
			.subscribe(fileName => {
				this.fileName = fileName;
			});
	}

	togglePlay() {
		if (this.fileName != null) {
			this.player.toggle(this.fileName);

			if (!this.preLoadedFutureLessons) {
				// When a class is played, download for the next two days.
				this.lessonMediaService.loadFilesForQuery({ type: this.track.type, date: 1, duration: 2 });
				this.preLoadedFutureLessons = true;
			}
		}
	}
}
