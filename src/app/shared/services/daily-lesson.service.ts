import { Injectable } from '@angular/core';
import { getJSON } from "tns-core-modules/http";
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable, from, ReplaySubject, throwError, concat, of } from 'rxjs';
import { map, tap, catchError, mergeMap } from 'rxjs/operators';
import { knownFolders, File } from 'tns-core-modules/file-system/file-system';
import { getString, setString } from 'tns-core-modules/application-settings/application-settings';
import { currentAppVersion } from './app-settings.service';
import { profile } from 'tns-core-modules/profiling/profiling';

const lessonApiUrl = 'https://lesson-api.herokuapp.com/';
const lessonManifestVersionSetting = "lesson-meta-version";

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

	@profile()
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
				// Make sure that file is up to date and of current app version.
				tap(library => {
					if (!library.has({ date: 2 })) {
						throw "Manifest doesn't have required dates.";
					}
					
					if (getString(lessonManifestVersionSetting, "") !== currentAppVersion) {
						getFile().removeSync();
						console.log("old lesson meta deleted");
						throw "Manifest created on older app version.";
					}
				}),
	
				// If file loading fails, load from network.
				catchError((e) => {
					console.log(`Not loading from file: ${e}`);
	
					return from(getJSON<DailyLessonTrack[]>(lessonApiUrl)).pipe(
						tap(tracks => ensureHasDates(<DailyLessonTrack[]>tracks)),
						// Save it to file.
						tap(tracks => this.saveJson(JSON.stringify(tracks))),
						// Update the app version which created the file.
						tap(() => {
							setString(lessonManifestVersionSetting, currentAppVersion);
						}),
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
