import { Injectable } from '@angular/core';
import { TNSPlayer } from 'nativescript-audio';
import { PlayerProgressService } from './player-progress.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettingsService } from './app-settings.service';
import { map } from 'rxjs/operators';

export enum PlaybackState {
	stopped,
	playing,
	paused
}

@Injectable({
	providedIn: 'root'
})
export class MediaPlayerService {
	private player: TNSPlayer;
	private currentFile: string;
	private playState$: BehaviorSubject<PlaybackState> = new BehaviorSubject(PlaybackState.stopped);
	private wasPausedByUser: boolean;

	constructor(
		private progress: PlayerProgressService,
		private settings: AppSettingsService
	) {
		this.player = new TNSPlayer();

		let self = this;
		// #3: don't resume from pause when regains audio focus.
		// Thank you, @masayoshiadachi (at https://github.com/nstudio/nativescript-audio/issues/148#issuecomment-490522070)
		this.player.resume = () => {
			// Resume is not called in my code; it's only called by TNSPlayer on regain of audio focus.
			// Only resume if the player wasn't paused by user.
			if (!self.wasPausedByUser) {
				self.player.play();
			}
		}

		this.settings.getPlaybackSpeed$().subscribe(speed => {
			if (this.player.isAudioPlaying()) {
				this.player.changePlayerSpeed(speed);
			}
		});
	}

	play(file: string) {
		this.currentFile = file;

		this.player.playFromUrl({
			audioFile: file,
			loop: false,
			completeCallback: () => this.playState$.next(PlaybackState.stopped)
		}).then(() => {
			this.progress.watch(this.player);
			this.playState$.next(PlaybackState.playing);
			this.player.changePlayerSpeed(this.settings.getPlaybackSpeed())
		})
	}

	// Toggle player. If a path is passed in, makes sure that file is playing.
	toggle(requestedFile?: string) {
		// If currently playing requested file, pause it.
		if (this.player.isAudioPlaying() && (requestedFile == null || this.currentFile == requestedFile)) {
			this.player.pause().then(succeeded => {
				if (succeeded) {
					this.progress.pause();
					this.playState$.next(PlaybackState.paused);
					this.wasPausedByUser = true;
				}
			});
		} else {
			// If currently paused with requested file, play it.
			if (this.currentFile != null && (requestedFile == null || this.currentFile == requestedFile)) {
				this.player.play().then(succeeded => {
					if (succeeded) {
						this.wasPausedByUser = false;
						this.playState$.next(PlaybackState.playing);
						this.progress.resume();
					}
				});
			} else if (requestedFile != null) {
				// If the requested file is not currently playing, start playing it.
				this.play(requestedFile);
			} else {
				console.log("ERROR: Runtime error: can not resume when file is not being played.");
			}
		}
	}

	isPlaying(): Observable<boolean> {
		return this.playState$.pipe(
			map(state => state != PlaybackState.stopped)
		);
	}

	playState(): Observable<PlaybackState> {
		return this.playState$;
	}
}
