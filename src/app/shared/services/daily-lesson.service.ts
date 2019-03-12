import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from, concat } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { knownFolders, File } from "tns-core-modules/file-system";

const lessonApiUrl: string = 'lesson-api.herokuapp.com';

function getFile(): File {
	return knownFolders.documents().getFile("json");
}

function parseLibrary(json: string): DailyStudyLibrary {
	let tracks = JSON.parse(json, (key, value) => {
		return key == "date" ? new Date(value) : value;
	});

	return new DailyStudyLibrary(tracks);
}

function getFromFile(): Observable<DailyStudyLibrary> {
	return from(getFile().readText()).pipe(
		map(json => parseLibrary(json))
	)
}

function ensureHasDates(tracks: DailyLessonTrack[]): DailyLessonTrack[] {
	return tracks.map(track => {
		track.days.forEach(day => day.date = new Date(day.date));
		return track;
	});
}

function saveJson(json: string) {
	return concat(
		from(getFile().remove()),
		from(getFile().writeText(json))
	)
}

@Injectable({
	providedIn: 'root'
})
export class DailyLessonServiceService {

	constructor(private http: HttpClient) { }

	library: DailyStudyLibrary;

	getLibrary(): Observable<DailyStudyLibrary> {
		// Try to load from memory.
		if (this.library) {
			return from([this.library]);
		}

		// Try to load from file.
		getFromFile().pipe(
			// If that fails, load from network.
			catchError(() => {
				return this.http.get<DailyLessonTrack[]>(lessonApiUrl).pipe(
					// Save it to file.
					tap(tracks => saveJson(JSON.stringify(tracks))),
					// Convert it to a library.
					map(tracks => new DailyStudyLibrary(ensureHasDates(tracks))),
					// Save the library to memory.
					tap(library => this.library = library)
				)
			})
		)
	}
	
}
