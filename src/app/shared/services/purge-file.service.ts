import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { path, Folder, File, FileSystemEntity } from 'tns-core-modules/file-system/file-system';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { DailyLessonService } from './daily-lesson.service';
import { MediaManifestService } from './media-manifest.service';
import { Lesson } from '../models/dailyLessons';
import { downloadFolderName } from './lesson-media.service';

/**
 * @description Check if item is contained in the array.
 */
function containedIn<T>(array: Array<T>, item: T): boolean {
	return array.indexOf(item) != -1;
}

/**
 * @description Remove all bad items from the array.
 * @param all All items.
 * @param bad Items which we don't want.
 * @returns Array with only good items.
 */
function removeFrom<T>(all: Array<T>, bad: Array<T>): Array<T> {
	return all.filter(item => !containedIn(bad, item));
}

@Injectable({
	providedIn: 'root'
})
export class PurgeFileService {

	constructor(
		private lessonService: DailyLessonService,
		private mediaManifestService: MediaManifestService) { }

	purge(): Observable<string[]> {
		let deletedFilePaths = new Array<string>();

		return zip(
			this.getAllFilesInDownloadPath(),
			this.getAllowedMedia()
		).pipe(
			// Get files to delete.
			map(([allFiles, allowedFiles]) => removeFrom(allFiles.map(file => file.path), allowedFiles)),
			// Save which files will be deleted.
			tap(filesToDelete => deletedFilePaths = filesToDelete),
			// Delete files which aren't allowed.
			mergeMap(filesToDelete => zip(...filesToDelete.map(file => File.fromPath(file).remove()))),
			map(() => deletedFilePaths),
			// Remove files to be deleted from manifest.
			tap((filesToDelete) => {
				this.mediaManifestService.removeWhere(item => filesToDelete.find(bad => item.path == bad) != null)
			}),
			catchError(error => {
				console.log(`Purge error: ${error}`);
				return of([]);
			})
		)
	}

	// Get the download folder from the manifest.
	private getAllFilesInDownloadPath(): Observable<FileSystemEntity[]> {
		return this.mediaManifestService.getManifest().pipe(
			mergeMap(downloadItems => {
				if (downloadItems.length < 1) {
					return throwError("Purge fail: no files to purge/unknown download path");
				}

				const downloadPath = downloadItems[0].path;

				// Make sure to only delete files in lessons-cache. There's no reason for this ever to happen, but
				// I really don't want to delete peoples files by accident.
				if (!downloadPath.includes(downloadFolderName)) {
					return throwError("Hey, I was about to delete from " + downloadPath + "!");
				}

				return File.fromPath(downloadPath).parent.getEntities();
			})
		)
	}

	private getAllowedMedia(): Observable<string[]> {
		return zip(
			// Get allowed files.
			this.lessonService.getLibrary().pipe(
				// Get the lessons which are still current.
				map(library => library.query({ date: -1, duration: 4 })),
				// Map each track to array of ids.
				map(tracks => tracks.map(tracks => tracks.days)),
				// Flatten the 2 dimensional array.
				map(tracks => new Array<Lesson>().concat(...tracks)),
			),
			// Get downloaded files.
			this.mediaManifestService.getManifest()
		).pipe(
			// Only files which were fully downloaded (and in the manifest) are allowed.
			map(([allowedLessons, downloadManifest]) => {
				// If there isn't a manifest, delete everything.
				if (downloadManifest.length == 0) {
					return [];
				}

				let allowedIds = allowedLessons.map(lesson => lesson.id);

				return downloadManifest
					// Filter for items which are allowed.
					.filter(item => allowedIds.indexOf(item.id) > -1)
					.map(item => item.path);
			})
		);
	}
}
