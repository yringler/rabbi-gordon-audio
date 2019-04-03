import { Injectable } from '@angular/core';
import { Lesson } from '../models/dailyLessons';
import { Observable, from, ReplaySubject, of, zip, concat } from 'rxjs';
import { map, flatMap, catchError, tap, retry, mergeMap} from 'rxjs/operators';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';
import { DownloadProgress } from "nativescript-download-progress"

/**
 * @description The folder where media is downloaded to.
 */
export const downloadFolder = knownFolders.documents().getFolder("lessons-cache").path;

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();

	/**
	 * @description Ensure that the media referenced by this lesson is downloaded.
	 */
	getFilesForLesson(lesson: Lesson): ReplaySubject<string> {
		const key = lesson.id;

		if (this.files.has(key)) {
			return this.files.get(key);
		}

		let mediaSubject$ = new ReplaySubject<string>();
		let media$ = this.loadMedia(lesson);

		// #11, #12: The current downloader seems to have issues with concurent downloads.
		// so wait untill all pending downloads are completed before doing the next one.
		if (this.files.size > 0) {
			concat(
				zip(Array.from(this.files.values())),
				media$
			).subscribe(mediaSubject$);
		} else {
			media$.subscribe(mediaSubject$);
		}

		this.files.set(key, mediaSubject$);
		return this.files.get(key);
	}

	// Downloads media for given lessons, and saves file object to the lesson.
	// Uses existing if already downloaded.
	private loadMedia(lesson: Lesson): Observable<string> {
		const filePath = path.join(downloadFolder, lesson.id);

		if (File.exists(filePath)) {
			return from([filePath]);
		}

		return from(new DownloadProgress().downloadFile(lesson.source, filePath)).pipe(
			// I observed that sometimes there will be an error. The download manager has concurrency issues.
			// Known bug: sometimes this won't work, needs to restart app.
			retry(3),
			catchError(err => {
				// I observed that err is always an empty object.
				console.log(`Download error: ${JSON.stringify(err)}`);

				if (File.exists(filePath)) {
					console.log(`deleted: ${filePath}`);
					File.fromPath(filePath).removeSync();
				}

				return of(null);
			}),
			tap(file => console.log(`downloaded to: ${file && file.path}`)),
			map(file => file && file.path),
		);
	}
}
