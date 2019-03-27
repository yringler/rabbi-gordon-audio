import { Injectable } from '@angular/core';
import { getJSON } from "tns-core-modules/http";
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from, concat, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { knownFolders, File, path } from 'tns-core-modules/file-system/file-system';

const lessonApiUrl: string = 'https://lesson-api.herokuapp.com/';

function ensureHasDates(tracks: DailyLessonTrack[]): DailyLessonTrack[] {
	return tracks.map(track => {
		track.days.forEach(day => {
			day.date = new Date(day.date);
		});
		return track;
	});
}

function parseLibrary(json: string): DailyStudyLibrary {
	let tracks: DailyLessonTrack[] = JSON.parse(json);
	ensureHasDates(tracks);

	return new DailyStudyLibrary(tracks);
}

function getFile(): File {
	return knownFolders.documents().getFile("lessonJson")
}

@Injectable({
	providedIn: 'root'
})
export class DailyLessonService {
	private library$: ReplaySubject<DailyStudyLibrary>;

	getLibrary(): ReplaySubject<DailyStudyLibrary> {

		// Try to load from memory.
		if (this.library$) {
			return this.library$;
		}

		this.library$ = new ReplaySubject<DailyStudyLibrary>();

		this.getManifest().subscribe(this.library$);

		return this.library$;
	}

	private getManifest(): Observable<DailyStudyLibrary> {
		let manifest$ =
			// Try to load from file.
			from(getFile().readText()).pipe(
				map(json => parseLibrary(json)),
				// Make sure that file is up to date.
				tap(library => {
					if (!library.has({ date: 2 })) {
						throw "Manifest doesn't have required dates."
					}
				}),
	
				// If file loading fails, load from network.
				catchError((e) => {
					console.log(`Not loading from file: ${e}`);
	
					return from(getJSON<DailyLessonTrack[]>(lessonApiUrl)).pipe(
						tap(tracks => ensureHasDates(<DailyLessonTrack[]>tracks)),
						// Save it to file.
						tap(tracks => this.saveJson(JSON.stringify(tracks))),
						// Convert it to a library.
						map(tracks => new DailyStudyLibrary(tracks))
					)
				})
			);
	
		return manifest$;
	}

	private async saveJson(json: string) {
		try {
			await getFile().remove();
			await getFile().writeText(json);
		}
		catch (err) {
			console.log(`Error in saveJson: ${err}`)
		}
	}
}
