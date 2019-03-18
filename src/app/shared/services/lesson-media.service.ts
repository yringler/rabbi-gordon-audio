import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { LessonQuery, DailyLessonTrack} from '../models/dailyLessons';
import { Observable, from, zip } from 'rxjs';
import { map, concatMap, tap, catchError, mergeMap } from 'rxjs/operators';
import { getFile } from 'tns-core-modules/http/http';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';

// Downloads media for given lessons, and saves file object to the lesson.
// Uses existing if already downloaded.
function loadMedia(tracks: DailyLessonTrack[]): Observable<DailyLessonTrack[]> {
	console.log("loading media...")
	let observableArray: Observable<File>[] = [];

	tracks.forEach(track => {
		track.days.forEach(day => {
			const filePath: string = path.join(knownFolders.currentApp().path, `${track.type}${day.date.valueOf()}.mp3`);
			let observableFile: Observable<File>;

			if (File.exists(filePath)) {
				observableFile = from([File.fromPath(filePath)]);
			} else {
				observableFile = from(getFile(day.source, filePath));
			}

			console.log("file: " + filePath);

			observableFile.pipe(
				tap(file => day.file = file),
				tap(file => console.log(`Downloaded: ${file.name}: ${file.size / 1024}`)),
				catchError((error, caught) => { console.log("error: " + error); return caught})
			)

			observableArray.push(observableFile);
		});
	});

	return zip(...observableArray).pipe(
		// After all the files are downloaded, re-emit the tracks array (which now have the file object set).
		tap(files => console.log(`DEBUG: ${files.length}, ${files[0].path}`)),
		map(() => tracks)
	)
}

@Injectable({
  providedIn: 'root'
})
export class LessonMediaService {

	constructor(private dailyLessonService: DailyLessonService) { }
	
	/**
	 * @description Ensure that the media referenced by this query is downloaded.
	 */
	getFilesForLessons(query: LessonQuery) : Observable<DailyLessonTrack[]> {
		return this.dailyLessonService.getLibrary().pipe(
			tap(() => console.log("Got lessons")),
			map(library => library.query(query)),
			mergeMap(tracks => loadMedia(tracks)),
			catchError((error, caught) => { console.log("Caught: " + error); return caught})
		)
	}
}
