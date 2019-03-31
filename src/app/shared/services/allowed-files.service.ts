import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { path, knownFolders } from 'tns-core-modules/file-system/file-system';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Files in the documents folder which should not be deleted.
const protectedFiles = ["app", "internal", "metadata", "lessonJson"];

@Injectable({
	providedIn: 'root'
})
export class AllowedFilesService {

	constructor(private lessonService: DailyLessonService) { }

	getAllowedFiles(): Observable<string[]> {
		return this.lessonService.getLibrary().pipe(
			// Get the lessons which are still current.
			map(library => library.query({ date: -1, duration: 4 })),
			// Map each track to array of file names.
			map(tracks => tracks.map(tracks => tracks.days.map(day => day.id))),
			// Flatten the 2 dimensional array.
			map(tracks => new Array<string>().concat(...tracks)),
			// Don't delete protected files.
			tap(fileNames => fileNames.push(...protectedFiles)),
			// Get full file paths.
			map(fileNames => fileNames.map(name => path.join(knownFolders.documents().path, name)))
		);
	}
}
