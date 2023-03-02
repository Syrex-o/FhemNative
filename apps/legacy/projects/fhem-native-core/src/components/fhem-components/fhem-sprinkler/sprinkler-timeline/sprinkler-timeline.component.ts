import { Component, Input, Output, NgModule, OnInit, OnChanges, SimpleChanges, OnDestroy, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject, Subscription} from 'rxjs';
// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Components
import { IonicModule } from '@ionic/angular';

// Services
import { TimeService } from '../../../../services/time.service';
import { ToastService } from '../../../../services/toast.service';
import { SettingsService } from '../../../../services/settings.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-timeline',
	templateUrl: './sprinkler-timeline.component.html',
	styleUrls: ['./sprinkler-timeline.component.scss']
})

export class SprinklerTimelineComponent implements OnInit, OnChanges, OnDestroy {
	@Input() sprinklers: any;
	// smart sprinkler device
	@Input() smartSprinkler!: FhemDevice|null;
	// weather device
	@Input() weather!: FhemDevice|null;
	// sprinkler Colors
	@Input() sprinklerColors!: any;
	// update trigger
	@Input() updater!: Subject<boolean>;
	private updateHandler!: Subscription;

	// change single sprinkler settings
	@Output() onSprinklerEdit: EventEmitter<{interval: number, index: number}>  = new EventEmitter();

	// time display holder
	timeArr: Array<any> = [];
	percentageArr: Array<any> = [];
	local: {today: string, percentage: string} = {today: this.time.local().weekdayText, percentage: '0%'};

	ngOnInit(){
		this.updateHandler = this.updater.subscribe((update: boolean)=>{
			// update timeline
			this.calculateTimelineValues();
		});
	}

	ngOnChanges(changes: SimpleChanges){
		if(changes.sprinklers && changes.sprinklers.currentValue.states.length > 0){
			this.calculateTimelineValues();
		}
	}

	private calculateTimelineValues(): void{
		const props: any = {
			start1: {min: 0, time: 0},
			end1: {min: 0, time: 0}, 
			duration1: {min: 0, time: 0}, 
			start2: {min: 0, time: 0}, 
			end2: {min: 0, time: 0}, 
			duration2: {min: 0, time: 0}, 
		};
		for (let i = 0; i < this.sprinklers.states.length; i++) {
			if(!this.timeArr[i]){
				this.timeArr[i] = props;
			}
			this.timeArr[i] = {
				start1: {min: this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin, time: this.sprinklers.times.interval1[i].smartStart},
				end1: {min: this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin, time: this.sprinklers.times.interval1[i].smartEnd},
				duration1: {min: this.time.times(this.sprinklers.times.interval1[i].smartDuration).toMin, time: this.sprinklers.times.interval1[i].smartDuration},
				start2: {min: this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin, time: this.sprinklers.times.interval2[i].smartStart},
				end2: {min: this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin, time: this.sprinklers.times.interval2[i].smartEnd},
				duration2: {min: this.time.times(this.sprinklers.times.interval2[i].smartDuration).toMin, time: this.sprinklers.times.interval2[i].smartDuration},
			};
			this.arrangeDays(this.timeArr[i].start1.min, this.timeArr[i].duration1.min, this.timeArr[i].end1.min, 'inter1', i);
			this.arrangeDays(this.timeArr[i].start2.min, this.timeArr[i].duration2.min, this.timeArr[i].end2.min, 'inter2', i);
		}
		this.local.percentage = ((this.time.local().timeMin / 1440) * 100) + '%';
	}

	private arrangeDays(start: number, duration: number, end: number, inter: string, index: number) {
		const intervalIndex: number = (inter === 'inter1') ? 1 : 2;
		const interval: string = (inter === 'inter1') ? 'interval1' : 'interval2';

		// relevant days of sprinkler
		const days: string[] = this.sprinklers.times[interval][index].days.days;
		// loop all days, to reset off days on change from timeline
		const allDays: string[] = ["1", "2", "3", "4", "5", "6", "0"];
		allDays.forEach((weekday: string)=>{
			let day: any = weekday;
			// sunday = 0 fix
			if (parseInt(day) === 0)  day = '7';
			if(days.includes(weekday)){
				// update needed
				this.calendarPercentage(start, end, duration, intervalIndex, index, day);
			}else{
				// crear data --> only if height was already assigned, when day was previously active
				if(this.percentageArr[index]){
					this.percentageArr[index]['heightP_' + intervalIndex + '_' + day] = '0%';
					let nextD: number = parseInt(day) + 1;
					if (day === '7') nextD = 1;
					// overlap 00:00 fix
					if( this.percentageArr[index]['heightFromNullP_' + intervalIndex + '_' + nextD] ){
						this.percentageArr[index]['heightFromNullP_' + intervalIndex + '_' + nextD] = '0%';
					}
				}
			}
		});
	}

	private calendarPercentage(start: number, end: number, duration: number, interval: number, index: number, dayPick: string) {
		if(!this.percentageArr[index]){
			this.percentageArr[index] = {};
		}
		let day = parseInt(dayPick);
		if (start > end) {
			// sunday = 0 fix
			if (day === 0) day = 7;
			// from 00:00 is arranged to next day
			let nextD = day + 1;
			if (day === 7) nextD = 1;
			this.percentageArr[index]['startFromNullP_' + interval + '_' + nextD] = '0%';
			this.percentageArr[index]['heightFromNullP_' + interval + '_' + nextD] = ((duration - (1440 - start)) / 1440) * 100 + '%';
		}
		this.percentageArr[index]['startP_' + interval + '_' + day] = ((start / 1440) * 100) + '%';
		this.percentageArr[index]['heightP_' + interval + '_' + day] = (duration / 1440) * 100 + '%';
	}

	// runtime of selected sprinkler
	showRuntime(i: number){
		let message: string = '', head: string = '';
		const time: any = this.timeArr[i];
		if(this.smartSprinkler){
			if (this.smartSprinkler.readings.winterMode.Value) {
				head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE');
				message = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.INFO');
			}else{
				// check for disabled runtimes
				head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME') + this.sprinklers.names[i];
				if(this.smartSprinkler.readings.enabled.Value && this.weather && (this.weather.readings.tooRainy.Value || this.weather.readings.tooWindy.Value)){
					if(this.weather.readings.tooRainy.Value){
						message = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.RAIN_TODAY_OFF');
					}
					if(this.weather.readings.tooWindy.Value){
						message = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.WIND_TODAY_OFF');
					}
				}else{
					const inter2: string = (this.smartSprinkler.readings.enableInterval2.Value) ? time.start2.time + ' - ' + time.end2.time + ' (' + time.duration2.time + ')' : this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.DEACTIVATED');
					head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME') + this.sprinklers.names[i];
					message = '<h2>Interval 1:</h2>' + time.start1.time + ' - ' + time.end1.time + ' (' + time.duration1.time + ')<br><br>' + '<h2>Interval 2:</h2>' + inter2;
				}
			}
			this.toast.showAlert(head, message, {
				buttons: [
					{
						text: this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.EDIT.INTERVAL_1'),
						handler: ()=>{ this.onSprinklerEdit.emit({interval: 1, index: i});}
					},
					{
						text: this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.EDIT.INTERVAL_2'),
						handler: ()=>{ this.onSprinklerEdit.emit({interval: 2, index: i});}
					},
					{text: this.translate.instant('GENERAL.BUTTONS.OKAY'), role: 'cancel'}
				]
			});
		}
	}

	ngOnDestroy(){
		if(this.updateHandler){
			this.updateHandler.unsubscribe();
		}
	}

	constructor(private time: TimeService, private toast: ToastService, private translate: TranslateService, public settings: SettingsService){}
}
@NgModule({
	imports: [
		CommonModule,
		IonicModule, 
		TranslateModule
	],
	declarations: [SprinklerTimelineComponent],
	exports: [SprinklerTimelineComponent]
})
export class SprinklerTimelineComponentModule {}