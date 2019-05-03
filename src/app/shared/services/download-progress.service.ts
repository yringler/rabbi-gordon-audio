import { Injectable } from '@angular/core';
import { Subject, Subscribable } from 'rxjs';
import { distinct, debounceTime } from 'rxjs/operators';

export class DownloadProgress {
	url: string;
	progress: number;
}

@Injectable({
	providedIn: 'root'
})
export class DownloadProgressService {
	private progress$: Subject<DownloadProgress> = new Subject;

	constructor() { }

	getProgress(): Subscribable<DownloadProgress> {
		return this.progress$.asObservable();
	}

	setProgress(progress: DownloadProgress) {
		this.progress$.next(progress);
	}
}
