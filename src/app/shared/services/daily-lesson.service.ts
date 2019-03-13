import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from, concat } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { LessonFileService } from './lesson-file.service';

const lessonApiUrl: string = 'https://lesson-api.herokuapp.com/';

function ensureHasDates(tracks: DailyLessonTrack[]): DailyLessonTrack[] {
	return tracks.map(track => {
		track.days.forEach(day => day.date = new Date(day.date));
		return track;
	});
}

function parseLibrary(json: string): DailyStudyLibrary {
	console.debug('read from file');

	let tracks = JSON.parse(json, (key, value) => {
		return key == "date" ? new Date(value) : value;
	});

	return new DailyStudyLibrary(tracks);
}

@Injectable({
	providedIn: 'root'
})
export class DailyLessonService {
	constructor(private http: HttpClient, private lessonFile:LessonFileService) { }

	private library: DailyStudyLibrary;

	getLibrary(): Observable<DailyStudyLibrary> {
		// Try to load from memory.
		if (this.library) {
			return from([this.library]);
		}

		// Try to load from file.
		return this.getFromFile().pipe(
			// If that fails, load from network.
			catchError(() => {
				console.log('no load from file');
				return this.http.get<DailyLessonTrack[]>(lessonApiUrl).pipe(
					// Save it to file.
					tap(tracks => this.saveJson(JSON.stringify(tracks))),
					// Convert it to a library.
					map(tracks => new DailyStudyLibrary(ensureHasDates(tracks))),
					// Save the library to memory.
					tap(library => this.library = library)
				)
			})
		)
	}

	private getFromFile(): Observable<DailyStudyLibrary> {
		return from(this.lessonFile.get().readText()).pipe(
			map(json => parseLibrary(json))
		)
	}

	private async saveJson(json: string) {
		try {
			await this.lessonFile.get().remove();
			await this.lessonFile.get().writeText(json);
		}
		catch (err) {
			console.log(`Error in saveJson: ${err}`)
		}
	}
}
