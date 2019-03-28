import { Injectable } from '@angular/core';
import { Lesson } from '../models/dailyLessons';
import { Observable, from, ReplaySubject } from 'rxjs';
import { map} from 'rxjs/operators';
import { path, knownFolders, File } from 'tns-core-modules/file-system/file-system';
import { Downloader } from 'nativescript-downloader';

@Injectable({
	providedIn: 'root'
})
export class LessonMediaService {
	private files: Map<string, ReplaySubject<string>> = new Map();
	private downloader = new Downloader();

	/**
	 * @description Ensure that the media referenced by this lesson is downloaded.
	 */
	getFilesForLesson(lesson: Lesson): ReplaySubject<string> {
		const key = lesson.id;

		if (this.files.has(key)) {
			return this.files.get(key);
		}

		let mediaSubject$ = new ReplaySubject<string>();

		this.loadMedia(lesson).subscribe(mediaSubject$);

		this.files.set(key, mediaSubject$);
		return this.files.get(key);
	}

	// Downloads media for given lessons, and saves file object to the lesson.
	// Uses existing if already downloaded.
	private loadMedia(lesson: Lesson): Observable<string> {
		const filePath = path.join(knownFolders.documents().path, lesson.id);

		if (File.exists(filePath)) {
			return from([filePath]);
		}

		let id = this.downloader.createDownload({
			fileName: filePath,
			url: lesson.source
		});

		return from(this.downloader.start(id)).pipe(
			map(file => file.path)
		);
	}
}
