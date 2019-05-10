import { Injectable } from '@angular/core';
import { Lesson, LessonQuery } from '../models/dailyLessons';
import { Observable, ReplaySubject, of, Subject, defer } from 'rxjs';
import { map, tap, mergeMap, switchMap, skipWhile, first } from 'rxjs/operators';
import { path } from 'tns-core-modules/file-system/file-system';
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';
import { NetworkPermissionService, PermissionReason } from './network-permission.service';
import { DownloadProgressService, DownloadState } from './download-progress.service';
import { DownloadManager } from 'nativescript-downloadmanager';


/**
 * @description The folder where media is downloaded to.
 */
export const downloadFolderName = "lessons-cache";

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();
	private loadRequest$: Subject<[Lesson, Subject<string>]> = new Subject;
	private downloader: DownloadManager

	constructor(
		private dailyLessonService: DailyLessonService,
		private mediaManifestService: MediaManifestService,
		private networkPermissionService: NetworkPermissionService,
		private downloadProgress: DownloadProgressService
	) {
		// #11, #12: The current downloader seems to have issues with concurrent downloads.
		// so wait until all pending downloads are completed before doing the next one.
		this.loadRequest$.pipe(
			mergeMap(([lesson, subject]) => {
				return this.loadMedia(lesson).pipe(
					tap(path => path && subject.next(path))
				);
			})
		).subscribe();

		this.downloader = new DownloadManager();
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
		return defer(() => {
			this.downloadProgress.setProgress({
				url: lesson.source,
				state: DownloadState.ongoing
			})

			return new Promise<string>((resolve, reject) => {
				this.downloader.downloadFile(lesson.source, (succeeded: boolean, uri: string) => {
					this.downloadProgress.setProgress({
						url: lesson.source,
						state: succeeded ? DownloadState.succeeded : DownloadState.failed
					});

					if (succeeded) {
						resolve(uri);
					} else {
						reject(`Download failed: ${lesson.source}`);
					}
				}, downloadFolderName, lesson.id);
			})
		}).pipe(
			tap(uri => console.log(`downloaded to: ${uri}`)),
			tap(uri => {
				let downloadFilePath = uri.replace("file://", "");
				downloadFilePath = downloadFilePath.replace(/\//g, path.separator);

				this.mediaManifestService.registerItem({
					id: lesson.id,
					uri: lesson.source,
					path: downloadFilePath
				});
			})
		);
	}
}
