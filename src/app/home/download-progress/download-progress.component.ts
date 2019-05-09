import { Component, OnInit, NgZone } from '@angular/core';
import { DownloadProgressService, DownloadProgress, DownloadState } from '~/app/shared/services/download-progress.service';

@Component({
	selector: 'download-progress',
	templateUrl: './download-progress.component.html',
	styleUrls: ['./download-progress.component.css'],
	moduleId: module.id,
})
export class DownloadProgressComponent implements OnInit {

	/** @description How far along an ongoing download is. */
	currentProgress: DownloadState;

	constructor(
		private downloadProgress: DownloadProgressService,
		private zone: NgZone) { }

	ngOnInit() {
		this.downloadProgress.getProgress().subscribe(progress => {
			this.zone.run(() => this.currentProgress = progress.state);
		})
	}

	get downloading():boolean {
		return this.currentProgress == DownloadState.ongoing;
	}

	get stateText(): string {
		return this.currentProgress == DownloadState.failed ? "Download failed" : null;
	}
}
