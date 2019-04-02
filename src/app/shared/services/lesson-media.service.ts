import { Injectable } from '@angular/core';
import { Lesson } from '../models/dailyLessons';
import { Observable, from, ReplaySubject, race } from 'rxjs';
import { map, catchError, tap, retry, mergeMap} from 'rxjs/operators';
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

		this.loadMedia(lesson).subscribe(mediaSubject$);

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
			catchError((err, caught) => {
				// I observed that err is always an empty object.
				console.log(`Download error: ${JSON.stringify(err)}`);

				this.safeDelete(filePath);

				return race(Array.from(this.files.values())).pipe(
					mergeMap(() => caught),
					tap(() => console.log("recovered from error."), () => this.safeDelete(filePath))
				)
			}),
			retry(4),
			tap(file => console.log(`downloaded to: ${file && file.path}`)),
			map(file => file && file.path),
		);
	}

	private safeDelete(filePath: string) {
		if (File.exists(filePath)) {
			console.log(`deleted: ${filePath}`);
			File.fromPath(filePath).removeSync();
		}
	}
}
