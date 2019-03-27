import { Injectable } from '@angular/core';
import { TNSPlayer } from 'nativescript-audio';
import { File } from 'tns-core-modules/file-system/file-system';

@Injectable({
	providedIn: 'root'
})
export class MediaPlayerService {
	private player: TNSPlayer;
	private currentFile: string;

	constructor() {
		this.player = new TNSPlayer();
	}

	play(file: string) {
		this.currentFile = file;

		this.player.playFromFile({
			audioFile: file,
			loop: false
		})
	}

	// Toggle player. If a path is passed in, makes sure that file is playing.
	toggle(requestedFile ?:string) {
		if (this.player.isAudioPlaying() && (requestedFile == null || this.currentFile == requestedFile)) {
			this.player.pause();
		} else {
			if (this.currentFile != null && (requestedFile == null || this.currentFile == requestedFile)) {
				this.player.resume();
			} else if (requestedFile != null) {
				this.play(requestedFile);
			} else {
				console.log("ERROR: Runtime error: can not resume when file is not being played.");
			}
		  }
	}
}
