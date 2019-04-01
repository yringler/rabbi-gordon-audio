import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { path, Folder, File } from 'tns-core-modules/file-system/file-system';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { DailyLessonService } from './daily-lesson.service';
import { downloadFolder } from './lesson-media.service';

@Injectable({
	providedIn: 'root'
})
export class PurgeFileService {

	constructor(private lessonService: DailyLessonService) { }

	purge(): Observable<string[]> {
		let deletedFilePaths = new Array<string>();

		return zip(
			Folder.fromPath(downloadFolder).getEntities(),
			this.getAllowedMedia()
		).pipe(
			// Get files to delete.
			map(([allFiles, allowedFiles]) => allFiles.filter(file => allowedFiles.indexOf(file.path) != -1)),
			// Save which files will be deleted.
			tap(filesToDelete => deletedFilePaths = filesToDelete.map(file => file.path)),
			// Delete files which aren't allowed.
			mergeMap(filesToDelete => zip(...filesToDelete.map(file => file.remove()))),
			map(() => deletedFilePaths),
			catchError(error => {
				console.log(`Purge error: ${error}`);
				return of([]);
			})
		)
	}

	private getAllowedMedia(): Observable<string[]> {
		return this.lessonService.getLibrary().pipe(
			// Get the lessons which are still current.
			map(library => library.query({ date: -1, duration: 4 })),
			// Map each track to array of file names.
			map(tracks => tracks.map(tracks => tracks.days.map(day => day.id))),
			// Flatten the 2 dimensional array.
			map(tracks => new Array<string>().concat(...tracks)),
			// Get full file paths.
			map(fileNames => fileNames.map(name => path.join(downloadFolder, name)))
		);
	}
}
