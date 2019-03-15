import { Injectable } from '@angular/core';
import { DailyLessonService } from './daily-lesson.service';
import { LessonQuery, DailyLessonTrack} from '../models/dailyLessons';
import { Observable } from 'rxjs';
import { map, concat } from 'rxjs/operators';

// Downloads media for given lessons, and saves file object to the lesson.
function downloadMedia(lessons: DailyLessonTrack[]): Observable<DailyLessonTrack[]> {
	
}

@Injectable({
  providedIn: 'root'
})
export class LessonMediaService {

	constructor(private dailyLessonService: DailyLessonService) { }
	
	/**
	 * @description Ensure that the media referenced by this query is downloaded.
	 */
	getFilesForLessons(query: LessonQuery) : Observable<DailyLessonTrack[]> {
		return this.dailyLessonService.getLibrary().pipe(
			map(library => library.query(query)),
			concat(downloadMedia)
		)
	}
}
