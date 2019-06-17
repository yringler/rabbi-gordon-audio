import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { TNSPlayer } from 'nativescript-will';
import { isIOS, isAndroid } from 'tns-core-modules/ui/page/page';

export class PlayerProgress {
	/** @description How long the media is, in seconds. */
	duration: number;
	/** @description How far along currently in the class, in seconds. */
	current: number;
}

var getSeconds: (duration: number) => number;

if(isIOS) {
	getSeconds = duration => duration;
} else if (isAndroid) {
	getSeconds = duration => duration / 1000;
}

@Injectable({
	providedIn: 'root'
})
export class PlayerProgressService {
	private progress$: ReplaySubject<PlayerProgress> = new ReplaySubject;
	private player: TNSPlayer;
	private intervalId: number;

	// The length of the audio class in seconds. This should be replaced with proper rxjs usage.
	private duration: number;

	getProgress(): Observable<PlayerProgress> {
		return this.progress$.asObservable();
	}

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

	seek(seconds: number) {
		this.player && this.player.seekTo(seconds).then(() => this.progress$.next({
			current: seconds,
			duration: this.duration
		}));
	}

	private setupInterval() {
		this.clearInterval();

		this.player.getAudioTrackDuration().then(duration => {
			this.duration = getSeconds(+duration);

			this.progress$.next({
				current: getSeconds(this.player.currentTime),
				duration: this.duration
			});

			let self = this;
			this.intervalId = setInterval(() => {
				self.progress$.next({
					current: getSeconds(self.player.currentTime),
					duration: self.duration
				});
			}, 1000);
		})
	}

	private clearInterval() {
		if (this.intervalId) {
			clearInterval(this.intervalId)
		}
	}
}
