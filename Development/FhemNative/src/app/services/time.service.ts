import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class TimeService {

	// returns time in obj (h,m,minutes) from HH:MM string
	public times(time: string): {[key: string]: number} {
		const min: any = parseInt(time.substr(0, 2)) * 60 + parseInt(time.substr(3, 2));
		return {
			hours: parseInt(time.substr(0, 2)),
			mins: parseInt(time.substr(3, 2)),
			toMin: min
		};
	}

	// return time HH:MM from min
	public minToTime(mins: number): string {
		let h: any = (Math.floor(mins / 60) >= 24) ? Math.floor(mins / 60) - 24 : Math.floor(mins / 60);
		let m: any = mins % 60;

		h = ( h < 10) ? '0' + h : h;
		m = (m < 10) ? '0' + m : m;
		return h + ':' + m;
	}

	private pad(num: number, size: number): string {
		return ('000' + num).slice(size * -1);
	}

	// return time HH:MM:SS from sec if HH > 0
	public secToTime(sec: any): string{
		let t: any = parseFloat(sec).toFixed(3);
		let h: any = Math.floor(t / 60 / 60);
		let m: any = Math.floor(t / 60) % 60;
		let s: any = Math.floor(t - m * 60);

		return (this.pad(h, 2) === '00' ? '' : this.pad(h, 2) + ':') + this.pad(m, 2) + ':' + this.pad(s, 2);
	}

	// return time HH:MM:SS from sec
	public secToFullTime(sec: any): string{
		let t: any = parseFloat(sec).toFixed(3);
		let h: any = Math.floor(t / 60 / 60);
		let m: any = Math.floor(t / 60) % 60;
		let s: any = Math.floor(t - m * 60);

		return this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2);
	}

	// returns duration in obj (min, durationTime) from time or minutes
	public duration(start: number|string, end: number|string): {mins: number, time: string} {
		const startMin: number = (typeof start === 'number') ? start : this.times(start).toMin;
		const endMin: number = (typeof end === 'number') ? end : this.times(end).toMin;

		let duration: number = endMin - startMin;
		if (duration <= 0) {
		  duration = 1440 - (startMin - endMin);
		}
		return {
			mins: duration,
			time: this.minToTime(duration)
		};
	}

	// returns relevant local time values
	public local(): {[key:string]:any} {
		const d = new Date();
		const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
		const weekdaysShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
		const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Okober', 'November', 'Dezenmber'];
		const hours = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
		const minutes = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
		const seconds = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
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
			timeMin: this.times(hours + ':' + minutes).toMin
		};
	}

	public addDay(date: any, days: number): Date{
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	// returns the end of time + duration in (time) from time or minutes
	public calcEnd(start: number|string, dur: number|string): string {
		const startTime: number = (typeof start === 'number') ? start : this.times(start).toMin;
		const duration: number =  (typeof dur === 'number') ? dur : this.times(dur).toMin;
		
		let result: number = startTime + duration;
		if (result >= 1440) {
			result = result - 1440;
		}
		return this.minToTime(result);
	}

	// return percentage time in (time) from percentage change
	public calcTimePercentage(duration: string, percentage: string, orientation: string): string {
		// calculation of duration +- percentage; returning time in obj (h,m,minutes)
		const durMin: number = this.times(duration).toMin;
		const percent: number = (parseInt(percentage) / 100) * durMin;
		const newDur: number = (orientation === 'negative') ? Math.floor(durMin - percent) : Math.floor(durMin + percent);
		return this.minToTime(newDur);
	}

	// return colliding times
	public checkTimeCollide(timestamps: Array<any>, root: boolean): any {
		// nedds time in min
		// returns true, if passed times collide
		// root TRUE analyses why times collided
		const analysis: number[] = [0, 0];
		if (timestamps[0].end >= timestamps[1].start || (timestamps[1].end >= timestamps[0].start && timestamps[1].end <= timestamps[0].end)) {
			if (root) {
				// analysis 0 = end1 collides with start2 (minutes)
				// analysis 1 = end2 collides with start1 (minutes)
				if (timestamps[0].end >= timestamps[1].start) {
					analysis[0] = timestamps[0].end - timestamps[1].start;
				}
				if (timestamps[1].end >= timestamps[0].start && timestamps[1].end <= timestamps[0].end) {
					analysis[1] = timestamps[1].end - timestamps[0].start;
				}
				return analysis;
			} else {
				return true;
			}
		} else {
			if (root) {
				return analysis;
			} else {
				return false;
			}
		}
	}
}
