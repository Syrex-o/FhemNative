interface DataSeries {
	name: string,
	series: {name: Date, value: number}[]
}

export interface HourData {
	min: number,
	max: number,
	data: DataSeries[]
}

export interface ForecastDay{
	date: string,
	rain: number,
	tempMax: number,
	tempMin: number
	weatherIcon: string,
	hourData: {
		temp: HourData,
		rain: HourData,
		wind: HourData
	}
}