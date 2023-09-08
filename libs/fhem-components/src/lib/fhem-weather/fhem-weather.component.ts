import { ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, delay, map, merge, of, shareReplay, switchMap, tap } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component';
import { TextBlockModule } from '@fhem-native/components';

import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';

import { Color, NgxChartsModule } from '@swimlane/ngx-charts';
import { curveMonotoneX, timeFormat, timeParse }  from 'd3';

import { inputIsNotNullOrUndefined } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

interface DataSeries {
	name: string,
	series: {name: Date, value: number}[]
}

interface ForecastDay{
	date: string,
	rain: number,
	tempMax: number,
	tempMin: number
	weatherIcon: string,
	hourData: {
		temp: DataSeries[]
	}
}

@Component({
	standalone: true,
	imports: [ 
		IonicModule,
		CommonModule,
		SwiperModule,
		NgxChartsModule,
		TextBlockModule,
		FhemComponentModule,
	],
	selector: 'fhem-native-component-weather',
	templateUrl: './fhem-weather.component.html',
	styleUrls: ['./fhem-weather.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FhemTimepickerComponent{
	@ViewChild('Swiper', {read: SwiperComponent}) swiper: SwiperComponent|undefined;
	swiperConfig: SwiperOptions = { loop: false, spaceBetween: 0 };

    // meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

    // Data
	@Input() device!: string;

	// Selections
	@Input() fhemModule!: string;
	// @Input() weatherType!: string;

	fhemDevice = new Subject<FhemDevice>();

	curve = curveMonotoneX;
	tempColorScheme = {domain: ['#f7c703']} as Color;
	tempyAxisTickFormatting(d: number){ return d + '°'; }

	formatAreaXAxis = (date: Date)=> {
		return timeFormat("%H")(date);
	}

	// ngx charts do not detect resize in container --> manually trigger
	private displayCharts = new BehaviorSubject(false);
	displayCharts$ = this.displayCharts.pipe(
		switchMap(x=> merge( of(x), of(true).pipe( delay(10) ) ) ),
		shareReplay(1)
	);

	selectedForecastDay$ = new BehaviorSubject(0);
	forecast$: Observable<ForecastDay[]> = this.fhemDevice.pipe(
		map(x=>{
			if(this.fhemModule === 'Proplanta') return this.proplantaDataMapper(x.readings);
			return [];
		})
	)

	constructor(private cdr: ChangeDetectorRef){}

    setFhemDevice(device: FhemDevice): void{ this.fhemDevice.next(device); }
	updateCharts(): void{ this.displayCharts.next(false); }

	private proplantaDataMapper(readings: Record<string, any>){
		const forecast: ForecastDay[] = [];
		const timeVals = ['00', '03', '06', '09', '12', '15', '18', '21'];

		// get forecast days
		const forecastDays = Math.max(...Object.keys(readings).map(x=>{
			const fcDay = x.match('fc\\d');
			if(fcDay && fcDay[0]) return parseInt( fcDay[0].replace('fc', '') );
			return null;
		}).filter(inputIsNotNullOrUndefined));
		
		for(let i = 0; i <= forecastDays; i++){
			const forecastDay: Record<string, any> = { hourData: {} };
			// get relevant readings
			const prefix = `fc${i}_`;
			// date
			if(readings[`${prefix}date`]){
				const date = timeParse('%d.%m.%Y')(readings[`${prefix}date`].Value);
				if(date) forecastDay['date'] =  timeFormat("%d.%m")( date );
			}
			// rain
			if(readings[`${prefix}rain`]) forecastDay['rain'] = readings[`${prefix}rain`].Value;
			// tempMax
			if(readings[`${prefix}tempMax`]) forecastDay['tempMax'] = readings[`${prefix}tempMax`].Value;
			// tempMin
			if(readings[`${prefix}tempMin`]) forecastDay['tempMin'] = readings[`${prefix}tempMin`].Value;
			// icons
			if(readings[`${prefix}weatherDayIcon`]){
				forecastDay['weatherIcon'] = readings[`${prefix}weatherDayIcon`].Value;
			}
			else if(readings[`${prefix}weatherIcon`]){
				forecastDay['weatherIcon'] = readings[`${prefix}weatherIcon`].Value;
			}

			// get hourly data
			const timestamps = timeVals.map(hourVal=>{
				try{
					const date = timeParse('%d.%m.%Y')(readings[`${prefix}date`].Value);
					if(!date) return null;
					date.setTime(date.getTime() + ( parseInt(hourVal) *60*60*1000));
					return { hourVal, date }
				}catch(err){
					return null;
				}
			}).filter(inputIsNotNullOrUndefined);

			// temp values
			forecastDay['hourData']['temp'] = [{
				name: 'Temp',
				series: timeVals.map((hourVal, i)=>{
					return {
						name: timestamps[i].date,
						value: readings[`${prefix}temp${hourVal}`] ? readings[`${prefix}temp${hourVal}`].Value : null
					}
				}).filter(x=> x.value !== null)
			}];

			forecast.push(forecastDay as ForecastDay);
		}
		return forecast;
	}

	switchSelectedForecastDay(dayIndex: number, fromSwiper?: boolean): void{
		this.selectedForecastDay$.next(dayIndex);
		if(!fromSwiper && this.swiper) this.swiper.swiperRef.slideTo(dayIndex, 300);
	}

	updateSelectedForecastDay(e: Swiper[]){
		const activeIndex = e[0].activeIndex;
		this.switchSelectedForecastDay(activeIndex, true);
		this.cdr.detectChanges();
	}
}