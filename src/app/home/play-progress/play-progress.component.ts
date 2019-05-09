import { Component, OnInit, NgZone } from '@angular/core';
import { PlayerProgressService } from '~/app/shared/services/player-progress.service';
import { Slider } from "tns-core-modules/ui/slider"
import { MediaPlayerService } from '~/app/shared/services/media-player.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'play-progress',
	templateUrl: './play-progress.component.html',
	styleUrls: ['./play-progress.component.css'],
	moduleId: module.id,
})
export class PlayProgressComponent implements OnInit {
	duration: number;

	current: number;

	/** 
	 * @description As the media plays, the Progress component is updated to the current location in the media.
	 * When that happens, the change event is fired.
	 * 
	 * Here, flag wether the change is from normal progress or from user jumping.
	 */
	changeIsFromProgress: boolean;

	isPlaying: Observable<boolean>;

	constructor(
		private playerProgress: PlayerProgressService,
		private player: MediaPlayerService,
		private zone: NgZone
	) { }

	ngOnInit() {
		this.playerProgress.getProgress().subscribe(
			progress => {
				this.zone.run(() => {
					this.duration = progress.duration;
					this.current = progress.current;

					this.changeIsFromProgress = true;
				});
			});
		
		this.isPlaying = this.player.isPlaying();
	}

	updateProgress(slider: Slider) {
		if (this.changeIsFromProgress) {
			this.changeIsFromProgress = false;
			return;
		}

		this.playerProgress.seek(slider.value);
	}
}
