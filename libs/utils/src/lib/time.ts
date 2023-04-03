import { utcToZonedTime } from 'date-fns-tz';

interface NumTimes {
    hours: number,
    mins: number
}

interface NumTimesExtended extends NumTimes {
    toMin: number
}

interface Local {
    month: number,
    monthText: string
    day: number,
    year: number,
    weekday: number
    weekdayText: string,
    weekdayTextShort: string,
    hour: string,
    minute: string,
    second: string,
    time: string
    dateRaw: Date,
    dateFormatted: string,
    timeMin: number
}

export function pad(num: number, size: number): string {
	return ('000' + num).slice(size * -1);
}

/**
 * returns time in obj (h,m,minutes) from HH:MM string
 * @param time 
 * @returns 
 */
export function times(time: string): NumTimesExtended {
    const min = parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(3, time.length));
    return {
        hours: parseInt(time.substring(0, 2)),
        mins: parseInt(time.substring(3, time.length)),
        toMin: min
    };
}

/**
 * return time HH:MM from min
 * @param mins 
 * @returns 
 */
export function minToTime(mins: number): string {
    const h = (Math.floor(mins / 60) >= 24) ? Math.floor(mins / 60) - 24 : Math.floor(mins / 60);
    const m = mins % 60;

    const formatH = ( h < 10) ? '0' + h : h.toString();
    const formatM = (m < 10) ? '0' + m : m.toString();

    return `${formatH}:${formatM}`;
}

/**
 * return time HH:MM:SS from sec if HH > 0
 * @param sec 
 * @returns 
 */
export function secToTime(sec: any): string{
    const t = parseFloat(parseFloat(sec).toFixed(3));
    const h = Math.floor(t / 60 / 60);
    const m = Math.floor(t / 60) % 60;
    const s = Math.floor(t - m * 60);

    return (pad(h, 2) === '00' ? '' : pad(h, 2) + ':') + pad(m, 2) + ':' + pad(s, 2);
}

/**
 * return time HH:MM:SS from sec
 * @param sec 
 * @returns 
 */
export function secToFullTime(sec: any): string{
    const t = parseFloat(parseFloat(sec).toFixed(3));
    const h = Math.floor(t / 60 / 60);
    const m = Math.floor(t / 60) % 60;
    const s = Math.floor(t - m * 60);

    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);
}

/**
 * returns duration in obj (min, durationTime) from time or minutes
 * @param start 
 * @param end 
 * @returns 
 */
export function duration(start: number|string, end: number|string): {min: number, time: string} {
    const startMin: number = (typeof start === 'number') ? start : times(start).toMin;
    const endMin: number = (typeof end === 'number') ? end : times(end).toMin;

    let duration: number = endMin - startMin;
    if (duration < 0) {
      duration = 1440 - (startMin - endMin);
    }
    return {
        min: duration,
        time: minToTime(duration)
    };
}

/**
 * returns relevant local time values
 * @returns 
 */
export function local(timeZone?: TimeZone): Local {
    const tz = timeZone || 'Europe/Berlin';
    const d = utcToZonedTime(new Date(), tz);

    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const weekdaysShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const hours = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours().toString();
    const minutes = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes().toString();;
    const seconds = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds().toString();;
    return{
        month: d.getMonth(),
        monthText: months[d.getMonth()],
        day: d.getDate(),
        year: d.getFullYear(),
        weekday: d.getDay(),
        weekdayText: weekdays[d.getDay()],
        weekdayTextShort: weekdaysShort[d.getDay()],
        hour: hours,
        minute: minutes,
        second: seconds,
        time: hours + ':' + minutes,
        dateRaw: d,
        dateFormatted: d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(),
        timeMin: times(hours + ':' + minutes).toMin
    };
}

export function addDay(date: any, days: number): Date{
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * returns the end of time + duration in (time) from time or minutes
 * @param start 
 * @param dur 
 * @returns 
 */
export function calcEnd(start: number|string, dur: number|string): string {
    const startTime: number = (typeof start === 'number') ? start : times(start).toMin;
    const duration: number =  (typeof dur === 'number') ? dur : times(dur).toMin;
    
    let result: number = startTime + duration;
    if (result >= 1440) result = result - 1440;
    return minToTime(result);
}

/**
 * return percentage time in (time) from percentage change
 * @param duration 
 * @param percentage 
 * @param orientation 
 * @returns 
 */
export function calcTimePercentage(duration: string, percentage: string, orientation: string): string {
    // calculation of duration +- percentage; returning time in obj (h,m,minutes)
    const durMin: number = times(duration).toMin;
    const percent: number = (parseInt(percentage) / 100) * durMin;
    const newDur: number = (orientation === 'negative') ? Math.floor(durMin - percent) : Math.floor(durMin + percent);
    return minToTime(newDur);
}

/**
 * eturn colliding times
 * @param timestamps 
 * @param root 
 * @returns 
 */
export function checkTimeCollide(timestamps: Array<any>, root: boolean): any {
    // nedds time in min
    // returns true, if passed times collide
    // root TRUE analyses why times collided
    const analysis: number[] = [0, 0];
    if (timestamps[0].end >= timestamps[1].start || (timestamps[1].end >= timestamps[0].start && timestamps[1].end <= timestamps[0].end)) {
        if(!root) return true;

        // analysis 0 = end1 collides with start2 (minutes)
        // analysis 1 = end2 collides with start1 (minutes)
        if (timestamps[0].end >= timestamps[1].start) {
            analysis[0] = timestamps[0].end - timestamps[1].start;
        }
        if (timestamps[1].end >= timestamps[0].start && timestamps[1].end <= timestamps[0].end) {
            analysis[1] = timestamps[1].end - timestamps[0].start;
        }
        return analysis;
    }
    return root ? analysis : false;
}

export type TimeZone = 'Europe/Berlin';