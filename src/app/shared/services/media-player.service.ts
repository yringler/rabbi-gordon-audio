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
	toggle(filePath ?:string) {
		if (this.player.isAudioPlaying() && (filePath == null || this.currentFile == filePath)) {
			this.player.pause();
		} else {
			if (this.currentFile != null && (filePath == null || this.currentFile == filePath)) {
				this.player.resume();
				console.log("resumed");
			} else if (filePath != null) {
				this.play(filePath);
				console.log("switched to file:" + filePath);
			} else {
				console.debug("ERROR: Runtime error: can not resume when file is not being played.");
			}
		  }
	}
}
