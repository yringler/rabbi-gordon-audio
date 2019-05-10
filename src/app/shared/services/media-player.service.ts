import { Injectable } from '@angular/core';
import { TNSPlayer } from 'nativescript-audio';
import { PlayerProgressService } from './player-progress.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettingsService } from './app-settings.service';

@Injectable({
	providedIn: 'root'
})
export class MediaPlayerService {
	private player: TNSPlayer;
	private currentFile: string;
	private isPlaying$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor(
		private progress: PlayerProgressService,
		private settings: AppSettingsService
	) {
		this.player = new TNSPlayer();
		// #3: don't resume from pause when regains audio focus.
		// Thank you, @masayoshiadachi (at https://github.com/nstudio/nativescript-audio/issues/148#issuecomment-490522070)
		this.player.resume = () => {}

		this.settings.getPlaybackSpeed$().subscribe(speed => {
			if (this.player.isAudioPlaying()) {
				this.player.changePlayerSpeed(speed);
			}
		});
	}

	play(file: string) {
		console.log("file:" + file)
		this.currentFile = file;

		this.player.playFromUrl({
			audioFile: file,
			loop: false,
			completeCallback: () => this.isPlaying$.next(false)
		}).then(() => {
			this.progress.watch(this.player);
			this.isPlaying$.next(true);
			this.player.changePlayerSpeed(this.settings.getPlaybackSpeed())
		})
	}

	// Toggle player. If a path is passed in, makes sure that file is playing.
	toggle(requestedFile ?:string) {
		if (this.player.isAudioPlaying() && (requestedFile == null || this.currentFile == requestedFile)) {
			this.player.pause();
			this.progress.pause();
		} else {
			if (this.currentFile != null && (requestedFile == null || this.currentFile == requestedFile)) {
				this.player.play();
				this.progress.resume();
			} else if (requestedFile != null) {
				this.play(requestedFile);
			} else {
				console.log("ERROR: Runtime error: can not resume when file is not being played.");
			}
		  }
	}

	isPlaying(): Observable<boolean> {
		return this.isPlaying$.asObservable();
	}
}
