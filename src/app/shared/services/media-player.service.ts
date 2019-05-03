import { Injectable } from '@angular/core';
import { TNSPlayer } from 'nativescript-audio';
import { on, suspendEvent, ApplicationEventData } from 'tns-core-modules/application/application';

@Injectable({
	providedIn: 'root'
})
export class MediaPlayerService {
	private player: TNSPlayer;
	private currentFile: string;
	// #3: Bug in player: if app is moved to background and speaker is released, starts playing.
	// Work around: on background, if not playing, stop, and save where stopped at to continue from there.
	private stoppedAt: number;

	constructor() {
		this.player = new TNSPlayer();
		
		on(suspendEvent, () => {
			// #3: When app is suspended, if paused, destroy player, and recreate, loading current file.

			if (!this.player.isAudioPlaying() && this.currentFile) {
				let stoppedAt = this.player.currentTime;

				this.player.dispose().then(() => {
					this.stoppedAt = stoppedAt;
					this.player = new TNSPlayer();
					this.player.initFromFile({
						audioFile: this.currentFile,
						loop: false
					});
				});
			}
		})
	}

	play(file: string, seek?: number) : Promise<any> {
		this.currentFile = file;

		return this.player.playFromFile({
			audioFile: file,
			loop: false
		}).then(() => {
			if (seek) {
				this.player.seekTo(seek);
			}
		})
	}

	// Toggle player. If a path is passed in, makes sure that file is playing.
	toggle(requestedFile ?:string) {
		if (this.player.isAudioPlaying() && (requestedFile == null || this.currentFile == requestedFile)) {
			this.player.pause();
		} else {
			if (this.currentFile != null && (requestedFile == null || this.currentFile == requestedFile)) {
				// #3: If app is suspended, continue playing from the current place.
				// When restored, reset stopped at property.
				if (this.stoppedAt) {
					this.play(this.currentFile, this.stoppedAt).then(() => this.stoppedAt = 0);
				} else {
					this.player.resume();
				}
			} else if (requestedFile != null) {
				this.play(requestedFile);
			} else {
				console.log("ERROR: Runtime error: can not resume when file is not being played.");
			}
		  }
	}
}
