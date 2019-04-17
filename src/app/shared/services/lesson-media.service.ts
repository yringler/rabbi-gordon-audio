import { Injectable } from '@angular/core';
import { Lesson, LessonQuery } from '../models/dailyLessons';
import { Observable, from, ReplaySubject, of, zip, concat } from 'rxjs';
import { map, flatMap, catchError, tap, retry, mergeMap} from 'rxjs/operators';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';
import { DownloadProgress } from "nativescript-download-progress"
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';

/**
 * @description The folder where media is downloaded to.
 */
export const downloadFolder = knownFolders.documents().getFolder("lessons-cache").path;

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();

	constructor(
		private dailyLessonService: DailyLessonService,
		private mediaManifestService: MediaManifestService
		) { }
	
	/**
	 * @description Load files which are used by the referenced query. Use case: Load files which we don't need
	 * right now, but may soon.
	 * 
	 * Perhaps this will be upgraded to return the files created, but YAGNE.
	 */
	loadFilesForQuery(query: LessonQuery) {
		this.dailyLessonService.getLibrary().pipe(
			map(library => new Array<Lesson>().concat(...library.query(query).map(tracks => tracks.days))),
			mergeMap(lessons => zip(lessons.map(lesson => this.getFilesForLesson(lesson))))
		).subscribe();
	}

	/**
	 * @description Ensure that the media referenced by this lesson is downloaded.
	 */
	getFilesForLesson(lesson: Lesson): ReplaySubject<string> {
		const key = lesson.id;

		if (this.files.has(key)) {
			return this.files.get(key);
		}

		let mediaSubject$ = new ReplaySubject<string>();

		// #11, #12: The current downloader seems to have issues with concurrent downloads.
		// so wait until all pending downloads are completed before doing the next one.
		if (this.files.size > 0) {
			zip(...Array.from(this.files.values())).pipe(
				mergeMap(() => this.loadMedia(lesson))
			).subscribe(mediaSubject$);
		} else {
			this.loadMedia(lesson).subscribe(mediaSubject$);
		}

		this.files.set(key, mediaSubject$);
		return this.files.get(key);
	}

	// Download media for given lessons.
	// Uses existing if already downloaded.
	private loadMedia(lesson: Lesson): Observable<string> {
		return this.mediaManifestService.getItem(lesson.id).pipe(
			mergeMap(downloadItem => {
				return downloadItem ?  of(downloadItem.path): this.downloadLesson(lesson);
			})
		);
	}

	private downloadLesson(lesson:Lesson): Observable<string>{
		const filePath = path.join(downloadFolder, lesson.id);

		return from(new DownloadProgress().downloadFile(lesson.source, filePath)).pipe(
			// Known bug: sometimes this won't work, needs to restart app.
			catchError(err => {
				// I observed that err is always an empty object.
				console.log(`Download error: ${JSON.stringify(err)}`);

				if (File.exists(filePath)) {
					console.log(`deleted: ${filePath}`);
					File.fromPath(filePath).removeSync();
				}

				return of(<File>null);
			}),
			tap(file => console.log(`downloaded to: ${file && file.path}`)),
			tap(file => file && this.mediaManifestService.registerItem({
				id: lesson.id,
				url: lesson.source,
				path: file.path
			})),
			map(file => file && file.path),
		);
	}
}
