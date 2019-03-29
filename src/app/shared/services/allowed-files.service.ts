import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { File, path, knownFolders } from 'tns-core-modules/file-system/file-system';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AllowedFilesService {

	constructor(private lessonService: DailyLessonService) { }

	getAllowedFiles(): Observable<string[]> {
		return this.lessonService.getLibrary().pipe(
			// Get the lessons which are still current.
			map(library => library.query({ date: -1, duration: 4 })),
			// Get the file names.
			map(tracks => new Array<string>().concat(...tracks.map(tracks => tracks.days.map(day => day.id)))),
			// The lesson manifest is also allowed.
			tap(fileNames => fileNames.push("lessonJson")),
			// Get full file paths.
			map(fileNames => fileNames.map(name => path.join(knownFolders.documents().path, name)))
		);
	}
}
