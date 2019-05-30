import { Injectable } from '@angular/core';
import { Lesson, LessonQuery, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, ReplaySubject, of, Subject, defer } from 'rxjs';
import { map, tap, mergeMap, switchMap, skipWhile, first, multicast, refCount, publishLast } from 'rxjs/operators';
import { path } from 'tns-core-modules/file-system/file-system';
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';
import { NetworkPermissionService, PermissionReason } from './network-permission.service';
import { DownloadProgressService, DownloadState } from './download-progress.service';
import { DownloadManager } from 'nativescript-downloadmanager';
import { HttpClient } from '@angular/common/http';
import { profile } from 'tns-core-modules/profiling/profiling';


/**
 * @description The folder where media is downloaded to.
 */
export const downloadFolderName = "lessons-cache";

const lessonSourceApiUrl = 'https://lesson-api.herokuapp.com/';

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();
	private loadRequest$: Subject<[Lesson, Subject<string>]> = new Subject;
	private downloader: DownloadManager
	private lessonSource$:Observable<Map<string, string>>;

	constructor(
		private dailyLessonService: DailyLessonService,
		private mediaManifestService: MediaManifestService,
		private networkPermissionService: NetworkPermissionService,
		private downloadProgress: DownloadProgressService,
		private http:HttpClient
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

		this.lessonSource$ = this.getLessonSource();
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
		return this.lessonSource$.pipe(
			map(sources => sources.get(lesson.id)),
			mergeMap(source => {
				this.downloadProgress.setProgress({
					url: source,
					state: DownloadState.ongoing
				})
	
				return new Promise<string>((resolve, reject) => {
					this.downloader.downloadFile(source, (succeeded: boolean, uri: string) => {
						this.downloadProgress.setProgress({
							url: source,
							state: succeeded ? DownloadState.succeeded : DownloadState.failed
						});
	
						if (succeeded) {
							resolve(uri);
						} else {
							reject(`Download failed: ${source}`);
						}
					}, downloadFolderName, lesson.id);
				})
			}),
			tap(uri => console.log(`downloaded to: ${uri}`)),
			tap(uri => {
				let downloadFilePath = uri.replace("file://", "");
				downloadFilePath = downloadFilePath.replace(/\//g, path.separator);

				this.mediaManifestService.registerItem({
					id: lesson.id,
					uri: uri,
					path: downloadFilePath
				});
			})
		);
	}
	
	@profile()
	private getLessonSource():Observable<Map<string, string>> {
		return this.http.get<DailyLessonTrack[]>(lessonSourceApiUrl).pipe(
			tap(() => console.log("http media source called.")),
			map(tracks => {
			  let map: Map<string,string> = new Map;
			  
			  tracks.forEach(track => {
				track.days.forEach(day => map.set(day.id, day.source))
			  });
	  
			  return map;
			}),
			publishLast(),
			refCount()
		);
	}
}
