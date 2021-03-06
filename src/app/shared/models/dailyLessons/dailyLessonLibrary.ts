import { addDays, isWithinRange, startOfDay, endOfDay } from "date-fns";
import { DailyLessonTrack, LessonQuery } from "./dailyLessons";

/**
 * @description All of the daily study information.
 */
export class DailyStudyLibrary {

	constructor(public tracks: DailyLessonTrack[]) { }

    /**
     * @description Query the daily study information.
     * An array of DailyLessonTrack is always returned, each of which has an array
     * of dates, but the arrays may only have one value, depending on the query options.
     * E.g: if you query for classes of a given type, the DailyLessonTrack[] will only
     * have one value.
     * And if you query for a single date, the DailyLessonTrack.days array will only have
     * a single value.
     */
	query(query?: LessonQuery): DailyLessonTrack[] {
        if (!query) {
            return this.tracks;
        } 

		let queriedTracks: DailyLessonTrack[] = this.tracks;

        // Filter lesson type.
        if (query.type) {
            queriedTracks = this.tracks.filter(track => track.type == query.type);
		}

		// If a duration is specified without a date, default to today
		if (query.duration != null && query.date == null) {
			query.date = 0;
		}

        // Filter date.
        if (query.date != null) {
            let startDate:Date;

            /* Get date to filter by. */
            if (typeof query.date == "number") {
                startDate = addDays(new Date, query.date);
            } else {
                startDate = query.date;
			}

			startDate = startOfDay(startDate);
			
			let duration = query.duration != null ? query.duration : 1;
			let lastDate = addDays(startDate, duration - 1);
			lastDate = endOfDay(lastDate);

            // Shallow clone the lessons so that we don't change the original array.
			queriedTracks = queriedTracks.map(track => Object.assign({}, track));

            // Only return requested date.
			queriedTracks.forEach(track => {
				track.days = track.days.filter(day => isWithinRange(day.date, startDate, lastDate));
			});
        }

        return queriedTracks.filter(track => track.days.length > 0);
	}
	
	has(query: LessonQuery): boolean {
		return this.query(query).length > 0;
	}
}