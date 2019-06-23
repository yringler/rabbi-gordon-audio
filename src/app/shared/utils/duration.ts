const secondsInMinute = 60;
const secondsInHour = secondsInMinute * 60;

/**
 * @description Formats the given duration in seconds to string of format hours:minutes:seconds
 * @param seconds Number of seconds duration.
 */
export function durationToString(seconds: number): string {
    const hours = Math.floor(seconds / secondsInHour);
    seconds -= hours * secondsInHour;

    const minutes = Math.floor(seconds / secondsInMinute);
    seconds -= minutes * secondsInHour;

    let durationParts:number[] = [];

    for (var part of [hours, minutes, seconds]) {
        if (part > 0) {
            durationParts.push(part);
        }
    }

    return durationParts.join(':');
}