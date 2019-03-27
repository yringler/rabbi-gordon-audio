import { Component, OnInit, Input } from '@angular/core';
import { DailyLessonTrack } from '~/app/shared/models/dailyLessons';
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
		private lessonMediaService:LessonMediaService) { }

	ngOnInit() {
	}

	@Input() track: DailyLessonTrack;

	togglePlay() {
		this.player.toggle(this.track.days[0].id);
	}
}
