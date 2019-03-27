import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { LessonQuery, DailyLessonTrack, Lesson} from '../models/dailyLessons';
import { Observable, from, zip, ReplaySubject } from 'rxjs';
import { map, concatMap, tap, catchError, mergeMap } from 'rxjs/operators';
import { getFile } from 'tns-core-modules/http/http';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';

function getFilePath(track: DailyLessonTrack) {
	return path.join(knownFolders.documents().path,
		`${track.type}_${track.days[0].date.valueOf()}`);
}

// Downloads media for given lessons, and saves file object to the lesson.
// Uses existing if already downloaded.
function loadMedia(track: DailyLessonTrack): Observable<string> {
	const filePath = getFilePath(track);

	if(File.exists(filePath)) {
		return from([filePath]);
	}

	return from(getFile(track.days[0].source, filePath)).pipe(
		map(file => file.path)
	);
}

function getKey(track:DailyLessonTrack): string {
	return `${track.type}_${track.days[1].date.valueOf()}`;
}

@Injectable({
  providedIn: 'root'
})
export class LessonMediaService {
	private files:Map<string, ReplaySubject<string>>;

	constructor() {
		this.files = new Map();
	}

	/**
	 * @description Ensure that the media referenced by this lesson is downloaded.
	 */
	getFilesForLesson(track: DailyLessonTrack) : ReplaySubject<string> {
		const key = getKey(track);

		if (this.files.has(key)) {
			return this.files.get(key);
		}

		let mediaFile$ = loadMedia(track);
		let mediaSubject$ = new ReplaySubject<string>();
		
		mediaFile$.subscribe(mediaSubject$);

		this.files.set(key, mediaSubject$);
		return this.files.get(key);
	}
}
