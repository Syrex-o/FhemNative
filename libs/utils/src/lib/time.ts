// time helper functions

export function times(time: string): {hours: number, mins: number, toMin: number} {
    const min: any = parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(3, 2));
    return {
        hours: parseInt(time.substring(0, 2)),
        mins: parseInt(time.substring(3, 2)),
        toMin: min
    };
}

export function local() {
    const d = new Date();
	const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
	const weekdaysShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
	const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Okober', 'November', 'Dezenmber'];
	const hours = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours().toString();
	const minutes = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes().toString();
	const seconds = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds().toString();
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