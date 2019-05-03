import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { TNSPlayer } from 'nativescript-audio';

export class PlayerProgress {
	/** @description How long the media is. */
	duration: number;
	/** @description How far along currently in the class. */
	current: number;
}

@Injectable({
	providedIn: 'root'
})
export class PlayerProgressService {
	private progress: ReplaySubject<PlayerProgress> = new ReplaySubject;
	private player: TNSPlayer;
	private intervalId: number;

	watch(player: TNSPlayer) {
		this.player = player;

		this.setupInterval();
	}

	pause() {
		this.clearInterval();
	}

	resume() {
		this.setupInterval();
	}

	private setupInterval() {
		this.clearInterval();

		this.player.getAudioTrackDuration().then(duration => {
			this.intervalId = setInterval(() => {
				this.progress.next({
					current: this.player.currentTime,
					duration: +duration // ios: seconds android: milliseconds
				});
			}, 500);
		})
	}

	private clearInterval() {
		if (this.intervalId) {
			clearInterval(this.intervalId)
		}
	}
}
