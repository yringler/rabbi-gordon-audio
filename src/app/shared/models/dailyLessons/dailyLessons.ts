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
 * @description Options to find a particular lessons/set of lessons.
 */
export class LessonQuery {
    /**
     * @description The offset from the current date. E.g: -1 is yesterday, 1 is
     * tommorow.
     * Or,the date which the lesson must occur on.
     */
    date?:number|Date;

    /**
     * @description What the lesson is on.
     */
    type?:DailyLessonType;
}