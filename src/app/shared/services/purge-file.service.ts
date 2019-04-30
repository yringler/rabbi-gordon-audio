import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { path, Folder, File } from 'tns-core-modules/file-system/file-system';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { DailyLessonService } from './daily-lesson.service';
import { downloadFolder } from './lesson-media.service';
import { MediaManifestService } from './media-manifest.service';

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
			Folder.fromPath(downloadFolder).getEntities(),
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

	private getAllowedMedia(): Observable<string[]> {
		return zip(
			// Get allowed files.
			this.lessonService.getLibrary().pipe(
				// Get the lessons which are still current.
				map(library => library.query({ date: -1, duration: 4 })),
				// Map each track to array of file names.
				map(tracks => tracks.map(tracks => tracks.days.map(day => day.id))),
				// Flatten the 2 dimensional array.
				map(tracks => new Array<string>().concat(...tracks)),
				// Get full file paths.
				map(fileNames => fileNames.map(name => path.join(downloadFolder, name)))
			),
			// Get downloaded files.
			this.mediaManifestService.getManifest()
		).pipe(
			// Only files which were fully downloaded are allowed.
			map(([allowedFiles, downloadManifest]) => {
				if (downloadManifest.length == 0) {
					return allowedFiles;
				}
				
				return allowedFiles.filter(allowedFile => downloadManifest.find(downloadedItem => {
					return downloadedItem.path == allowedFile
				}))
			})
		);
	}
}
