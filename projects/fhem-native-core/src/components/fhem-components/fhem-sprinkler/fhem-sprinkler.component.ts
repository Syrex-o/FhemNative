import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef, Type } from '@angular/core';
import { Subject } from 'rxjs';

// Translator
import { TranslateService } from '@ngx-translate/core';

// Directives
import { NewsSlideModule } from '../../../directives/news-slide.directive'

// Components
import { IonicModule } from '@ionic/angular';
import { LoaderModule } from '../../loader/loader.component';
import { FhemComponentModule } from '../fhem-component.module';
import { SwitchComponentModule } from '../../switch/switch.component';
import { PickerComponentModule } from '../../picker/picker.component';
import { PopoverComponentModule } from '../../popover/popover.component';

// Sprinkler Parts
import { SprinklerSmartComponentModule } from './sprinkler-smart/sprinkler-smart.component';
import { SprinklerColorsComponentModule } from './sprinkler-colors/sprinkler-colors.component';
import { SprinklerWinterComponentModule } from './sprinkler-winter/sprinkler-winter.component';
import { SprinklerWeatherComponentModule } from './sprinkler-weather/sprinkler-weather.component';
import { SprinklerSettingsComponentModule } from './sprinkler-settings/sprinkler-settings.component';
import { SprinklerTimelineComponentModule } from './sprinkler-timeline/sprinkler-timeline.component';

// Services
import { FhemService } from '../../../services/fhem.service';
import { TimeService } from '../../../services/time.service';
import { ToastService } from '../../../services/toast.service';
import { StorageService } from '../../../services/storage.service';
import { SettingsService } from '../../../services/settings.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

// Interfaces
import { FhemDevice, ComponentSettings } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-sprinkler',
	templateUrl: './fhem-sprinkler.component.html',
	styleUrls: ['./fhem-sprinkler.component.scss']
})

export class FhemSprinklerComponent implements OnInit, OnDestroy {
	// placeholder of picker for single sprinkler setting
	@ViewChild('CONFIG_CONTAINER', { static: false, read: ViewContainerRef }) CONFIG_CONTAINER!: ViewContainerRef;
	// Component ID
	@Input() ID!: string;

	// needed devices
	@Input() data_device!: string|string[];
	@Input() data_weather!: string;
	@Input() data_smartSprinkler!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	// full loaded
	fullyLoaded: boolean = false;
	// transformed sprinkler devices
	sprinklers: any = {
		times: {interval1: [], interval2: [], manual: [], next: []},
		states: [],
		names: []
	};
	// subtitles
	sprinklerSubtitles: string[] = [];
	// sprinkler weather device
	weatherDevice!: FhemDevice|null;
	// smart sprinkler device
	smartSprinkler!: FhemDevice|null;

	// possbile manual times
	private manualTimes: number[] = [10, 20, 30, 40, 50];

	// menus
	winterMenu: boolean = false;
	smartSprinklerMenu: boolean = false;
	weatherMenu: boolean = false;
	colorMenu: boolean = false;
	settingsMenu: boolean = false;
	timeLineMenu: boolean = false;

	// sprinkler colors
	sprinklerColors: any;

	// trigger update
	updater: Subject<boolean> = new Subject();

	ngOnInit(){
		if(this.data_device){
			this.data_device = (typeof this.data_device === 'string') ? this.data_device.replace(/\s/g, '').split(',') : this.data_device;

			let requestArr: string[] = JSON.parse(JSON.stringify(this.data_device));
			requestArr.push(this.data_weather, this.data_smartSprinkler);

			// request devices
			requestArr.forEach((device: string, index: number)=>{
				this.fhem.getDevice(this.ID + device, device, (device: FhemDevice)=>{
					this.getSprinklerDevice(device, index);
					if(device){
						this.detectNextTimes();
						this.getSubtitles();
					}
				}).then((device: FhemDevice|null)=>{
					this.getSprinklerDevice(device, index);
					// check total length
					if(index === requestArr.length -1 && this.sprinklers.states.length > 0){
						// all sprinklers loaded
						this.fullyLoaded = true;
						this.detectNextTimes();
						this.getSubtitles();
					}
				});
			});
			// get sprinkler colors
			this.storage.setAndGetSetting({name: 'sprinklerColors', default: '{"color": []}'}).then((res: any)=>{
				this.sprinklerColors = res;
				// check for length matching
				(this.data_device as Array<string>).forEach((device: string, i: number)=>{
					if(!this.sprinklerColors.color[i]){
						this.sprinklerColors.color.push({"val": "#ddd"});
					}
				});
			});
		}
	}

	// get and update sprinkler devices
	private getSprinklerDevice(device: FhemDevice|null, index: number): void{
		if(device){
			const readings: any = device.readings;
			// check if device is a sprinkler
			if(readings.callbackState){
				// check if device is a sprinkler
				// loop the intervals
				for (let j = 1; j <= 2; j++) {
					// initial check
					if(!this.sprinklers.times['interval' + j][index]){
						this.sprinklers.times['interval' + j][index] = {};
					}
					// update sprikler values
					this.sprinklers.times['interval' + j][index] = {
						device: device.device,
						startTime: readings['interval' + j].Value.match(/(^.{5})/)[0],
						endTime: readings['interval' + j].Value.match(/.{5}$/)[0],
						smartStart: readings['smartStart' + j].Value,
						smartEnd: readings['smartEnd' + j].Value,
						smartDuration: this.time.duration(readings['smartStart' + j].Value, readings['smartEnd' + j].Value).time,
						duration: this.time.duration(readings['interval' + j].Value.match(/(^.{5})/)[0], readings['interval' + j].Value.match(/.{5}$/)[0]).time,
						days: this.days(readings['days' + j].Value)
					}
				}
				// attatch states and callbacks seperatly, to keep switch animation
				// attatch states
				if(!this.sprinklers.states[index]){
					this.sprinklers.states[index] = {};
				}
				this.sprinklers.states[index]['state'] = readings.state.Value;
				// attatch callbacks
				this.sprinklers.states[index]['callback'] = readings.callbackState.Value;
				// attatch names
				if(!this.sprinklers.names[index]){
					this.sprinklers.names.push(readings.name.Value);
				}else{
					this.sprinklers.names[index] = readings.name.Value;
				}
				// attatch manual times
				if(!this.sprinklers.times.manual[index]){
					this.sprinklers.times.manual[index] = {};
				}
				this.sprinklers.times.manual[index] = {
					startTime: readings.manualTime.Value.match(/(^.{5})/)[0],
					endTime: readings.manualTime.Value.match(/(.{5}$)/)[0]
				};
			}
			// check if device is weather
			if(device.device === this.data_weather){
				this.weatherDevice = device;
			}
			// check if device is smart sprinkler
			if(device.device === this.data_smartSprinkler){
				this.smartSprinkler = device;
				// trigger updater
				this.updater.next(true);
			}
		}
	}

	// calc days and reformat
	private days(weekdays: any) {
		let days: string[]  = [], arr: string[] = [], allDays: boolean = false;
		weekdays = typeof weekdays === 'number' ? weekdays.toString() : weekdays;
		// dict
		const weekdayDict: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

		for (let i = 0; i < weekdays.length; i++) {
			days.push(weekdays.slice(i, i + 1));

			for(let j: number = 0; j < weekdayDict.length; j++){
				if(weekdays[i] === j.toString()){
					arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.' + weekdayDict[j]));
					break;
				}
			}
		}
		for (let k = 0; k < arr.length - 2; k++) {
			arr[k] = arr[k] + ', ';
		}
		if(arr.length -2 >= 0){
			arr[arr.length - 2] = arr[arr.length - 2] + ' ' + this.translate.instant('GENERAL.DICTIONARY.AND') + ' ';
		}
		if (weekdays.length === 7) {allDays = true; }
		return { days, textDays: arr, fhemDays: weekdays, allDays};
	}

	private detectNextTimes(): void{
		this.sprinklers.times.next = [];
		const local = this.time.local().timeMin;
		for (let i = 0; i < this.sprinklers.states.length; i++) {
			this.sprinklers.times.next.push({
					startTime: '',
					endTime: '',
					duration: ''
			});
			const start1: number = this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin;
			const start2: number = this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin;
			const end1: number = this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin;
			const end2: number = this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin;
			if (this.smartSprinkler && !this.smartSprinkler.readings.enableInterval2.Value) {
				this.sprinklers.times.next[i].startTime = this.checkForDay(i, 1, this.sprinklers.times.interval1[i].smartStart);
					this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval1[i].smartEnd;
					this.sprinklers.times.next[i].duration = this.sprinklers.times.interval1[i].smartDuration;
			} else {
				if (local >= end1) {
					this.sprinklers.times.next[i].startTime = this.checkForDay(i, 2, this.sprinklers.times.interval2[i].smartStart);
					this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval2[i].smartEnd;
					this.sprinklers.times.next[i].duration = this.sprinklers.times.interval2[i].smartDuration;
				}
				if (local >= end2 || local <= start1 || local >= start1 && local <= end1) {
					this.sprinklers.times.next[i].startTime = this.checkForDay(i, 1, this.sprinklers.times.interval1[i].smartStart);
					this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval1[i].smartEnd;
					this.sprinklers.times.next[i].duration = this.sprinklers.times.interval1[i].smartDuration;
				}
			}
		}
	}

	private checkForDay(index: number, interval: number, value: string): string|false {
		// check if current day is inserted
		const currentDay = this.time.local().weekday;
		const fhemDays = this.sprinklers.times['interval' + interval][index].days.fhemDays;
		return (fhemDays.indexOf(currentDay.toString()) !== -1) ? value : false;
	}

	// toggle run interval
	toggleAll(state: boolean): void{
		if (!this.checkWinter()) {
			if(!state){
				this.checkManualRuntime().then((time: number)=>{
					if(time > 0){
						this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'true');
					}
				});
			}else{
				this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'false');
			}
		}
	}

	// toggle single sprinkler
	toggle(state: boolean, i: number): void{
		if (!this.checkWinter()) {
			if(!state){
				if (this.smartSprinkler && this.smartSprinkler.readings.runInterval.Value) {
					this.toast.showAlert(
						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.INFO'),
						false
					);
				}else{
					this.checkManualRuntime().then((time: number)=>{
						if(time > 0){
							this.sprinklers.states.forEach((state: boolean, i: number)=>{
								if (this.sprinklers.times.manual[i].startTime !== '00:00') {
									this.fhem.setAttr(this.data_device[i], 'manualTime', '00:00-00:00');
								}
							});
							// set on
							setTimeout(()=>{
								this.fhem.setAttr(
									this.data_device[i],
									'manualTime',
									this.time.local().time + '-' + this.time.calcEnd(this.time.local().timeMin, time)
								);
							}, 50);
							setTimeout(()=>{
								this.fhem.setAttr(this.data_smartSprinkler, 'manualMode', 'true');
							}, 100);
						}
					});
				}
			}else{
				this.fhem.set(this.data_device[i], 'false');
			}
		}
	}

	private checkWinter(): boolean{
		if(this.smartSprinkler && this.smartSprinkler.readings.winterMode.Value){
			const prefix: string = 'COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE';
			this.toast.showAlert(
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
				this.translate.instant(prefix + '.TITLE') + this.translate.instant(prefix + '.CAN_NOT_START.INFO'),
				false
			);
			return true;
		}
		return false; 
	}

	// manual runtime check
	private checkManualRuntime(): Promise<number>{
		return new Promise((resolve)=>{
			if(this.smartSprinkler && this.smartSprinkler.readings && this.smartSprinkler.readings.manualRuntime){
				// build inputs
				let inputs: Array<{label: string, value: number, type: string, checked: boolean}> = [];
				this.manualTimes.forEach((time: number)=>{
					inputs.push({
						label: time + 'min', 
						value: time,
						type: 'radio',
						checked: (this.smartSprinkler && this.smartSprinkler.readings && (this.smartSprinkler.readings.manualRuntime.Value === time)) ? true : false
					});
				});
				this.toast.showAlert(
					this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUN_INTERVAL.SELECT_MANUAL'),
					'', { inputs: inputs,
					buttons: [
						{
							text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
							role: 'cancel',
							handler: ()=>{
								// action cancelled --> no trigger
								resolve(0);
							}
						},
						{
							text: this.translate.instant('GENERAL.BUTTONS.CONFIRM'),
							handler: (data: number) => {
								if(this.smartSprinkler && this.smartSprinkler.readings){
									if(this.smartSprinkler.readings.manualRuntime.Value !== data){
										// update fhem reading
										this.fhem.setAttr(this.data_smartSprinkler, 'manualRuntime', data);
									}
									resolve(data);
								}
								resolve(0);
							}
						}
					]}
				);
			}else{
				// 
				resolve(30);
			}
		});
	}

	// get subtitles on init and update
	private getSubtitles(): void{
		for (let i = 0; i < this.sprinklers.states.length; i++) {
			if(!this.sprinklerSubtitles[i]){
				this.sprinklerSubtitles[i] = '';
			}
			this.sprinklerSubtitles[i] = this.subTitleResolver(i);
		}
	}

	// resovle sprinkler relevant subtitle
	private subTitleResolver(i: number): string{
		const lib: string = 'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL';
		const text: string = (this.sprinklers.states[i].callback ? this.translate.instant(lib + '.CURRENT') : this.translate.instant(lib + '.NEXT'));

		let result: string = '';
		let smartCond: string|null = null;
		if (
			this.smartSprinkler && this.weatherDevice && this.smartSprinkler.readings.enabled && 
			this.smartSprinkler.readings.rain.Value && this.weatherDevice.readings.tooRainy.Value && 
			this.smartSprinkler.readings.wind.Value && this.weatherDevice.readings.tooWindy.Value) {
			smartCond = ( this.smartSprinkler.readings.enabled.Value ?
				( this.smartSprinkler.readings.rain.Value && this.weatherDevice.readings.tooRainy.Value ?
					this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_RAINY') :
					( this.smartSprinkler.readings.wind.Value && this.weatherDevice.readings.tooWindy.Value ?
						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_WINDY')  : null
					)
				) : null
			);
		}
		if(this.smartSprinkler){
			if(this.smartSprinkler.readings.winterMode.Value){
				const prefix: string = 'COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE';
				result = this.translate.instant(prefix + '.TITLE') + this.translate.instant(prefix + '.CAN_NOT_START.INFO');
			}else{
				const manualRuntime: number = this.smartSprinkler.readings.manualRuntime ? this.smartSprinkler.readings.manualRuntime.Value : 30;
				if (smartCond !== null) {
					result = smartCond;
					if (this.sprinklers.times.manual[i].startTime !== '00:00') {
						result = text + this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:'+manualRuntime+')';
					}
				}else{
					result = text + ( this.sprinklers.times.manual[i].startTime !== '00:00' ?
						this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:'+manualRuntime+')' :
						(this.sprinklers.times.next[i].startTime ?
							this.sprinklers.times.next[i].startTime + ' - ' + this.sprinklers.times.next[i].endTime + ' (' + this.sprinklers.times.next[i].duration + ')' :
							this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.NOT_TODAY')
						)
					);
				}
			}
		}
		return result;
	}

	// create sprinkler edit menu
	async editSprinkler(event: {interval: number, index: number}): Promise<any>{
		const comp: Type<any> = await this.componentLoader.loadDynamicComponentFromPath('components/fhem-components/fhem-sprinkler/sprinkler-config/sprinkler-config');
		this.componentLoader.createSingleComponentNonStandard('SprinklerConfig', comp, this.CONFIG_CONTAINER, {
			config: event,
			sprinklers: this.sprinklers,
			smartSprinkler: this.smartSprinkler,
			sprinklerColor: this.sprinklerColors.color[event.index].val
		});
	}

	ngOnDestroy(){
		// combine all gedives for request
		let requestArr: string[] = JSON.parse(JSON.stringify(this.data_device));
		requestArr.push(this.data_weather, this.data_smartSprinkler);
		// remove all devices from listener
		requestArr.forEach((device: string)=>{
			this.fhem.removeDevice(this.ID + device);
		});
	}

	constructor(
		private fhem: FhemService,
		private time: TimeService,
		private toast: ToastService,
		private storage: StorageService,
		public settings: SettingsService,
		private translate: TranslateService,
		private componentLoader: ComponentLoaderService){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Sprinkler',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: 'Sprinkler1,Sprinkler2,Sprinkler3,Sprinkler4,Sprinkler5,Sprinkler6'},
				{variable: 'data_weather', default: 'WetterInfo'},
				{variable: 'data_smartSprinkler', default: 'SmartSprinkler'}
			],
			dimensions: {minX: 200, minY: 200}
		};
	}
}
@NgModule({
	imports: [
		IonicModule,
		LoaderModule,
		NewsSlideModule,
		FhemComponentModule,
		SwitchComponentModule,
		PickerComponentModule,
		PopoverComponentModule,
		// Sprinkler Parts
		SprinklerSmartComponentModule,
		SprinklerColorsComponentModule,
		SprinklerWinterComponentModule,
		SprinklerWeatherComponentModule,
		SprinklerSettingsComponentModule,
		SprinklerTimelineComponentModule
	],
	declarations: [FhemSprinklerComponent]
})
class FhemSprinklerComponentModule {}