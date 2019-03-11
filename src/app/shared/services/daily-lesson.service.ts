import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { knownFolders, File } from "tns-core-modules/file-system";

const lessonApiUrl: string = 'lesson-api.herokuapp.com';

function getFile(): File {
	return knownFolders.documents().getFile("json");
}

function parseJSON(json: string): DailyStudyLibrary {
	return JSON.parse(json, (key, value) => {
		return key == "date" ? new Date(value) : value;
	});
}

function getFromFile(): DailyStudyLibrary {
	try {
		return parseJSON(getFile().readTextSync());
	}
	catch {
		return null;
	}
}

function saveJson(json: string) {
	// Delete any old data.
	getFile().removeSync();

	// Save the new data.
	getFile().writeTextSync(json)
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
		let library = getFromFile();

		if (library) {
			this.library = library;
			return this.getLibrary();
		}

		// Download, cache to memory and file.
		return this.http.get<DailyLessonTrack[]>(lessonApiUrl).pipe(
			map(tracks => {
				let tracksWithDates = tracks.map(track => {
					track.days.forEach(day => day.date = new Date(day.date));
					return track;
				});

				let library = new DailyStudyLibrary();
				library.tracks = tracksWithDates;

				return library;
			}),
			tap(library => this.library = library),
			tap(library => saveJson(JSON.stringify(library)))
		);
	}
	
}