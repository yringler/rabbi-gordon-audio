import { Injectable } from '@angular/core';
import { TNSPlayer } from 'nativescript-audio';
import { PlayerProgressService } from './player-progress.service';

@Injectable({
	providedIn: 'root'
})
export class MediaPlayerService {
	private player: TNSPlayer;
	private currentFile: string;

	constructor(private progress: PlayerProgressService) {
		this.player = new TNSPlayer();
	}

	play(file: string) {
		this.currentFile = file;

		this.player.playFromFile({
			audioFile: file,
			loop: false
		}).then(() => this.progress.watch(this.player))
	}

	// Toggle player. If a path is passed in, makes sure that file is playing.
	toggle(requestedFile ?:string) {
		if (this.player.isAudioPlaying() && (requestedFile == null || this.currentFile == requestedFile)) {
			this.player.pause();
			this.progress.pause();
		} else {
			if (this.currentFile != null && (requestedFile == null || this.currentFile == requestedFile)) {
				this.player.resume();
				this.progress.resume();
			} else if (requestedFile != null) {
				this.play(requestedFile);
			} else {
				console.log("ERROR: Runtime error: can not resume when file is not being played.");
			}
		  }
	}
}
