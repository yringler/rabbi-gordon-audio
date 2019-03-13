/**
 * @description The diffrent types which are studied every day.
 */
export enum DailyLessonType {
	Chumash,
	Tanya,
	Rambam
}

/**
 * @description One lesson to learn.
 */
export class Lesson {
	date: Date;
	source: string;
	title: string;
}

/**
 * @description A collection of daily lessons of one type.
 */
export class DailyLessonTrack {
	type: DailyLessonType;
	title: string;
	days: Lesson[];
}

/**
 * @description Options to find a particular lessons/set of lessons.
 */
export class LessonQuery {
    /**
     * @description The offset from the current date. E.g: -1 is yesterday, 1 is
     * tommorow.
     * Or,the date which the lesson must occur on.
     */
	date?: number | Date;

	/**
	 * @description The number of days from given date which should be returned.
	 */
	duration?: number;

    /**
     * @description What the lesson is on.
     */
	type?: DailyLessonType;
}