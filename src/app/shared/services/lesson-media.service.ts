import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { LessonQuery, DailyLessonTrack, Lesson} from '../models/dailyLessons';
import { Observable, from, zip, ReplaySubject } from 'rxjs';
import { map, concatMap, tap, catchError, mergeMap } from 'rxjs/operators';
import { getFile } from 'tns-core-modules/http/http';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';

// Downloads media for given lessons, and saves file object to the lesson.
// Uses existing if already downloaded.
function loadMedia(lesson:Lesson): Observable<string> {
	const filePath = path.join(knownFolders.documents().path, lesson.id);

	if (File.exists(filePath)) {
		return from([filePath]);
	}

	return from(getFile(lesson.source, filePath)).pipe(
		map(file => file.path)
	);
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
	getFilesForLesson(lesson:Lesson) : ReplaySubject<string> {
		const key = lesson.id;

		if (this.files.has(key)) {
			return this.files.get(key);
		}

		let mediaSubject$ = new ReplaySubject<string>();
		
		loadMedia(lesson).subscribe(mediaSubject$);

		this.files.set(key, mediaSubject$);
		return this.files.get(key);
	}
}
