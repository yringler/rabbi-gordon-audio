import { Injectable } from '@angular/core';
import { Subject, Subscribable } from 'rxjs';

export enum DownloadState {
	ongoing,
	succeeded,
	failed
}

export class DownloadProgress {
	url: string;
	state: DownloadState;
}

@Injectable({
	providedIn: 'root'
})
export class DownloadProgressService {
	private progress$: Subject<DownloadProgress[]> = new Subject;
	private progress: Map<string, DownloadProgress> = new Map;

	constructor() { }

	getProgress(): Subscribable<DownloadProgress[]> {
		return this.progress$.asObservable();
	}

	setProgress(progress: DownloadProgress) {
		this.progress.set(progress.url, progress);

		this.progress$.next(Array.from(this.progress.values()));
	}
}
