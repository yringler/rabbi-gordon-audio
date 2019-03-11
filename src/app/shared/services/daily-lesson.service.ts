import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailyStudyLibrary, DailyLessonTrack } from '../models/dailyLessons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const lessonApiUrl: string = 'lesson-api.herokuapp.com';

@Injectable({
	providedIn: 'root'
})
export class DailyLessonServiceService {

	constructor(private http: HttpClient) { }

	getLibrary(): Observable<DailyStudyLibrary> {
		return this.http.get<DailyLessonTrack[]>(lessonApiUrl).pipe(
			map(tracks => {
				let tracksWithDates = tracks.map(track => {
					track.days.forEach(day => day.date = new Date(day.date));
					return track;
				});

				let library = new DailyStudyLibrary();
				library.tracks = tracksWithDates;

				return library;
			})
		);
	}
}
