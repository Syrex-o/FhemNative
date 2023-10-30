import { ChangeDetectorRef, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, delay, map, merge, of, shareReplay, switchMap } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component';
import { TextBlockModule } from '@fhem-native/components';
import { ResizedEvent } from '@fhem-native/directives';
import { proplantaDataMapper } from './mappers';

import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';

import { Color, NgxChartsModule } from '@swimlane/ngx-charts';
import { curveMonotoneX, timeFormat }  from 'd3';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';
import { ForecastDay } from './fhem-weather.type';

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
	@ViewChild('Swiper', {read: SwiperComponent, static: false}) swiper: SwiperComponent|undefined;
	swiperConfig: SwiperOptions = { loop: false, spaceBetween: 10 };

    // meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

    // Data
	@Input() device!: string;

	// Selections
	@Input() fhemModule!: string;
	@Input() displayType!: string;

	fhemDevice = new Subject<FhemDevice>();

	currentChartItem$ = new BehaviorSubject(0);
	chartItems = ['TEMP', 'RAIN', 'WIND'];

	curve = curveMonotoneX;
	formatAreaXAxis = (date: Date)=> { return timeFormat("%H:%M")(date); }

	tempColorScheme = {domain: ['#f7c703']} as Color;
	rainColorScheme = {domain: ['#8ab4f8']} as Color;
	windColorScheme = {domain: ['#aebfcf']} as Color;

	tempyAxisTickFormatting(d: number){ return d + '°'; }
	rainyAxisTickFormatting(d: number){ return d + 'l/m2'; }
	windyAxisTickFormatting(d: number){ return d + 'km/h'; }

	// ngx charts do not detect resize in container --> manually trigger
	private displayCharts = new BehaviorSubject(false);
	displayCharts$ = this.displayCharts.pipe(
		switchMap(x=> merge( of(x), of(true).pipe( delay(10) ) ) ),
		shareReplay(1)
	);

	selectedForecastDay$ = new BehaviorSubject(0);
	forecast$: Observable<ForecastDay[]> = this.fhemDevice.pipe(
		map(x=>{
			if(this.fhemModule === 'Proplanta') return proplantaDataMapper(x.readings);
			return [];
		})
	)

	constructor(private cdr: ChangeDetectorRef){}

    setFhemDevice(device: FhemDevice): void{
		this.getCurrChartItem();
		this.fhemDevice.next(device);
	}

	updateCharts(event: ResizedEvent): void{
		if(!event.isFirst) this.displayCharts.next(false);
	}

	private getCurrChartItem(){
		if(this.displayType === 'details' || this.displayType === 'cards') return;

		// detailed chart views
		if(this.displayType === 'only-rain') return this.selectChart(1);
		if(this.displayType === 'only-wind') return this.selectChart(2);
	}

	selectChart(chartItemIndex: number): void{
		this.currentChartItem$.next(chartItemIndex);
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