import { Injectable } from '@angular/core';
import { getJSON } from "tns-core-modules/http";
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from, concat, ReplaySubject, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, multicast } from 'rxjs/operators';
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
	let tracks:DailyLessonTrack[] = JSON.parse(json);
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
	constructor() { }

	private library$: BehaviorSubject<DailyStudyLibrary>;

	getLibrary(): Observable<DailyStudyLibrary> {
		// Try to load from memory.
		if (this.library$) {
			return this.library$;
		}

		let libraryStream =
			// Try to load from file.
			from(getFile().readText()).pipe(
				map(json => parseLibrary(json)),
				// Make sure that file is up to date.
				tap(library => {
					if (!library.has({ date: 0 })) {
						throw "Failed to load from file: doesn't have required dates."
					}
				}),
				// If file loading fails, load from network.
				catchError((e) => {
					console.log(`Failed to load from file: ${e}`);

					return from(getJSON<DailyLessonTrack[]>(lessonApiUrl)).pipe(
						tap(tracks => ensureHasDates(<DailyLessonTrack[]>tracks)),
						// Set the name where the media file will be saved.
						tap(tracks => {
							tracks.forEach(track => {
								track.days.forEach(day => {
									let fileName = path.join(knownFolders.documents().path, `${track.type}_${day.date.valueOf()}`);
									day.file = fileName;
								})
							})
						}),
						// Save it to file.
						tap(tracks => this.saveJson(JSON.stringify(tracks))),
						// Convert it to a library.
						map(tracks => new DailyStudyLibrary(tracks))
					)
				})
			);
		
		this.library$ = new BehaviorSubject(new DailyStudyLibrary([]));
		libraryStream.subscribe(this.library$);

		return this.library$;
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
