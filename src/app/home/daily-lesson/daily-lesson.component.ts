import { Component, OnInit, Input } from '@angular/core';
import { DailyLessonTrack } from '~/app/shared/models/dailyLessons';
import { MediaPlayerService } from '~/app/shared/services/media-player.service';

@Component({
	selector: 'daily-lesson',
	templateUrl: './daily-lesson.component.html',
	styleUrls: ['./daily-lesson.component.css'],
	moduleId: module.id,
})
export class DailyLessonComponent implements OnInit {

	constructor(private player: MediaPlayerService) { }

	ngOnInit() {
	}

	@Input() track: DailyLessonTrack;

	togglePlay() {
		console.log(this.track.days[0].file);
		this.player.toggle(this.track.days[0].file.path);
	}
}
