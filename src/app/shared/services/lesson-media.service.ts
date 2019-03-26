import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { LessonQuery, DailyLessonTrack, Lesson} from '../models/dailyLessons';
import { Observable, from, zip } from 'rxjs';
import { map, concatMap, tap, catchError, mergeMap } from 'rxjs/operators';
import { getFile } from 'tns-core-modules/http/http';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';

// Downloads media for given lessons, and saves file object to the lesson.
// Uses existing if already downloaded.
function loadMedia(tracks: DailyLessonTrack[]): Observable<DailyLessonTrack[]> {
	let observableArray: Observable<File>[] = [];

	tracks.forEach(track => {
		track.days.forEach(day => {
			let observableFile: Observable<File>;

			if (File.exists(day.file)) {
				observableFile = from([File.fromPath(day.file)]);
			} else {
				observableFile = from(getFile(day.source, day.file));
			}

			observableFile.pipe(
				catchError((error, caught) => { console.log("error: " + error); return caught})
			)

			observableArray.push(observableFile);
		});
	});

	return zip(...observableArray).pipe(
		// After all the files are downloaded, re-emit the tracks array (which now have the file object set).
		map(() => tracks)
	)
}

@Injectable({
  providedIn: 'root'
})
export class LessonMediaService {
	/**
	 * @description Ensure that the media referenced by this lesson is downloaded.
	 */
	getFilesForLesson(lesson: Lesson) : Observable<string> {
		return this.dailyLessonService.getLibrary().pipe(
			map(library => library.query(query)),
			mergeMap(tracks => loadMedia(tracks)),
			catchError((error, caught) => { console.log("Caught: " + error); return caught})
		)
	}
}
