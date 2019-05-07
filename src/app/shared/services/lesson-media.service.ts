import { Injectable } from '@angular/core';
import { Lesson, LessonQuery } from '../models/dailyLessons';
import { Observable,  ReplaySubject, of, Subject, throwError, defer, concat } from 'rxjs';
import { map, catchError, tap, mergeMap, concatMap, retry, switchMap, skipWhile, first } from 'rxjs/operators';
import { path, knownFolders, File, } from 'tns-core-modules/file-system/file-system';
import { DownloadProgress } from "nativescript-download-progress"
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';
import { NetworkPermissionService, PermissionReason } from './network-permission.service';
import { DownloadProgressService } from './download-progress.service';

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
		private networkPermissionService: NetworkPermissionService,
		private downloadProgress: DownloadProgressService
	) {
		// #11, #12: The current downloader seems to have issues with concurrent downloads.
		// so wait until all pending downloads are completed before doing the next one.
		this.loadRequest$.pipe(
			concatMap(([lesson, subject]) => {
				return this.loadMedia(lesson).pipe(
					tap(path => path && subject.next(path))
				);
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
					return this.downloadLessonWithPermission(lesson);
				}
			})
		);
	}

	/** @description Waits for permission, then downloads the lesson. */
	private downloadLessonWithPermission(lesson: Lesson): Observable<string> {
		return this.networkPermissionService.getPermission().pipe(
			// Ask for permission from user, if that's the only reason can't download.
			tap(permission => {
				if (!permission.canDownload && permission.reason == PermissionReason.unknown) {
					this.networkPermissionService.requestPermission();
				}
			}),
			// Don't do anything until can download.
			skipWhile(permission => !permission.canDownload),
			first(),
			switchMap(() => this.downloadLesson(lesson))
		);
	}

	/** @description Downloads the lesson. */
	private downloadLesson(lesson: Lesson): Observable<string> {
		const filePath = path.join(downloadFolder, `${lesson.id}`);

		return defer(() => {
			console.log(`Attempting download: ${lesson.source}`);

			let downloader = new DownloadProgress();
			downloader.addProgressCallback((progress: number) => {
				this.downloadProgress.setProgress({
					progress: progress,
					url: lesson.source
				});
			});

			return downloader.downloadFile(lesson.source, filePath);
		}).pipe(
			// Known bug: sometimes download fails.
			catchError(err => {
				// I observed that err is -always- usually an empty object.
				console.log(`Download error (from ${lesson.source}): ${JSON.stringify(err)}`);

				if (File.exists(filePath)) {
					return concat(
						// If there's a partial, invalid file, delete it.
						File.fromPath(filePath).remove(),
						throwError(err)
					)
				} else {
					return throwError(err);
				}
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
	}
}
