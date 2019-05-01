import { Injectable } from '@angular/core';
import { Lesson, LessonQuery } from '../models/dailyLessons';
import { Observable, from, ReplaySubject, of, Subject, timer, throwError, defer } from 'rxjs';
import { map, catchError, tap, mergeMap, concatMap, retryWhen, take, delay, retry, switchMap, skipWhile, first } from 'rxjs/operators';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';
import { DownloadProgress } from "nativescript-download-progress"
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';
import { NetworkPermissionService } from './network-permission.service';

/**
 * @description The folder where media is downloaded to.
 */
export const downloadFolder = knownFolders.documents().getFolder("lessons-cache").path;

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();
	private loadRequest$: Subject<[Lesson, Subject<string>]> = new Subject;

	constructor(
		private dailyLessonService: DailyLessonService,
		private mediaManifestService: MediaManifestService,
		private networkPermissionService: NetworkPermissionService
	) {
		// #11, #12: The current downloader seems to have issues with concurrent downloads.
		// so wait until all pending downloads are completed before doing the next one.
		this.loadRequest$.pipe(
			concatMap(([lesson, subject]) => {
				this.loadMedia(lesson).subscribe(
					path => subject.next(path)
				);

				return of(null);
			})
		).subscribe();
	}

	/**
	 * @description Load files which match the given query. Use case: Load media which will
	 * only be needed in the next few days.
	 * 
	 * Perhaps this will be upgraded to return the files created, but YAGNE.
	 */
	loadFilesForQuery(query: LessonQuery) {
		this.dailyLessonService.getLibrary().pipe(
			map(library => new Array<Lesson>().concat(...library.query(query).map(tracks => tracks.days))),
			mergeMap(lessons => lessons.map(lesson => this.getFilesForLesson(lesson)))
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
		this.loadRequest$.next([lesson, mediaSubject$]);
		this.files.set(key, mediaSubject$);

		return this.files.get(key);
	}

	// Get media path for given lessons.
	// Uses existing if already downloaded.
	private loadMedia(lesson: Lesson): Observable<string> {
		return this.mediaManifestService.getItem(lesson.id).pipe(
			mergeMap(downloadItem => {
				/*
				 * If the item has been successfully downloaded, use it.
				 * Otherwise, download it.
				 */
				if (downloadItem != null) {
					return of(downloadItem.path);
				} else {
					return this.downloadLesson(lesson);
				}
			})
		);
	}

	private downloadLesson(lesson: Lesson): Observable<string> {
		const filePath = path.join(downloadFolder, `${lesson.id}.mp3`);

		const download$ = defer(() => new DownloadProgress().downloadFile(lesson.source, filePath)).pipe(
			tap(() => console.log(`Attempting download: ${filePath} from ${lesson.source}`)),
			// Known bug: sometimes download fails.
			catchError(err => {
				// I observed that err is -always- usually an empty object.
				console.log(`Download error (from ${lesson.source}): ${JSON.stringify(err)}`);
				return throwError(err);
			}),
			retry(3),
			tap(file => console.log(`downloaded to: ${file && file.path}`)),
			tap(file => file && this.mediaManifestService.registerItem({
				id: lesson.id,
				url: lesson.source,
				path: file.path
			})),
			map(file => file && file.path)
		);

		return this.networkPermissionService.getPermission().pipe(
			skipWhile(canDownload => !canDownload),
			first(),
			switchMap(() => download$)
		)
	}
}
