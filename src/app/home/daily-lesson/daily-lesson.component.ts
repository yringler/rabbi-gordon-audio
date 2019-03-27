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
		this.player.toggle(this.fileName);
	}
}
