/**
 * @description The diffrent types which are studied every day.
 */
export enum DailyLessonType {
    Chumash = "Chumash",
    Tanya = "Tanya",
    Rambam = "Rambam"
}

/**
 * @description One lesson to learn.
 */
export class Lesson {
    date:Date;
    url:string;
}

/**
 * @description A collection of daily lessons of one type.
 */
export class DailyLessonTrack {
    type:DailyLessonType;
    title:string;
    days:Lesson[];
}

/**
 * @description All of the daily study information.
 */
export class DailyStudyLibrary {
    tracks:DailyLessonTrack[];

    getForDate(date:Date):any {
    }
}