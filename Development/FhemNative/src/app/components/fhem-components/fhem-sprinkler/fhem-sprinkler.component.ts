import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components.module';

// services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { TimeService } from '../../../services/time.service';
import { StorageService } from '../../../services/storage.service';
import { ToastService } from '../../../services/toast.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'fhem-sprinkler',
	templateUrl: './fhem-sprinkler.component.html',
  	styleUrls: ['./fhem-sprinkler.component.scss']
})
export class FhemSprinklerComponent implements OnInit, OnDestroy {
	// Component ID
	@Input() ID: string;

	// needed devices
	@Input() data_device: string|string[];
	@Input() data_weather: string;
	@Input() data_smartSprinkler: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	// menu states
	menus: {[key: string]: boolean} = {
		winterMenu: false,
		smartMenu: false,
		weatherMenu: false,
		colorMenu: false,
		settingsMenu: false,
		timelineMenu: false
	};

	// Sprinkler Definition
	sprinklers: any = {
        times: {interval1: [], interval2: [], manual: [], next: []},
        states: [],
        names: [],
        smart: {},
        weather: {},
        totalDuration: {start1: '', end1: '', start2: '', end2: '', duration1: '', duration2: ''}
    };

    // timeline def
    local: any = {today: this.time.local().weekdayText, percentage: 0};
    timeArr: Array<any> = [];

    // sprinkler colors
    sprinklerColors: any;

	ngOnInit(){
		if(this.data_device){
			this.data_device = (typeof this.data_device === 'string') ? this.data_device.replace(/\s/g, '').split(',') : this.data_device;
			// reset arrays
			this.sprinklers.times.interval1 = [];
			this.sprinklers.times.interval2 = [];
			this.sprinklers.times.manual = [];
			this.sprinklers.states = [];
			this.sprinklers.names = [];

			// combine all gedives for request
			let requestArr = JSON.parse(JSON.stringify(this.data_device));
			requestArr.push(this.data_weather, this.data_smartSprinkler);

			requestArr.forEach((device: string, index: number)=>{
				this.fhem.getDevice(this.ID + device, device, (device)=>{
					this.getSprinklerDevice(device, index);
					// update 
					this.totalDurations();
					this.initTimeLine();
				    this.detectNextTimes();
				}).then((device)=>{
					this.getSprinklerDevice(device, index);
					// check total length
					if(index === requestArr.length -1){
						this.totalDurations();
						this.initTimeLine();
				        this.detectNextTimes();
					}
				});
			});
			// fill colors
			this.storage.setAndGetSetting({
				name: 'sprinklerColors',
				default: '{"color": [{"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}, {"val": "#ddd"}]}'
			}).then((res)=>{
				this.sprinklerColors = res;
			});
		}
	}

	// get and update sprinkler devices
	private getSprinklerDevice(device: any, index: number){
		if(device){
			const reading = device.readings;
			// check if device is a sprinkler
			if(reading.callbackState){
				// sprinkler device detected
				// loop the intervals
				for (let j = 1; j <= 2; j++) {
					// initial check
					if(!this.sprinklers.times['interval' + j][index]){
						this.sprinklers.times['interval' + j][index] = {};
					}
					// update sprikler values
					this.sprinklers.times['interval' + j][index] = {
						device: device.device,
						startTime: reading['interval' + j].Value.match(/(^.{5})/)[0],
						endTime: reading['interval' + j].Value.match(/.{5}$/)[0],
						smartStart: reading['smartStart' + j].Value,
						smartEnd: reading['smartEnd' + j].Value,
						smartDuration: this.time.duration(reading['smartStart' + j].Value, reading['smartEnd' + j].Value).time,
						duration: this.time.duration(reading['interval' + j].Value.match(/(^.{5})/)[0], reading['interval' + j].Value.match(/.{5}$/)[0]).time,
						days: this.days(reading['days' + j].Value)
					};
				}
				// attatch states and callbacks seperatly, to keep switch animation
				// attatch states
				if(!this.sprinklers.states[index]){
					this.sprinklers.states[index] = {};
				}
				this.sprinklers.states[index]['state'] = reading.state.Value;

				// attatch callbacks
				this.sprinklers.states[index]['callback'] = reading.callbackState.Value;

				// attatch names
				if(!this.sprinklers.names[index]){
					this.sprinklers.names.push(reading.name.Value.replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/Ã/g, 'ß'));
				}else{
					this.sprinklers.names[index] = reading.name.Value.replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/Ã/g, 'ß');
				}

				// // attatch manual times
				if(!this.sprinklers.times.manual[index]){
					this.sprinklers.times.manual[index] = {};
				}
				this.sprinklers.times.manual[index] = {
					startTime: reading.manualTime.Value.match(/(^.{5})/)[0],
					endTime: reading.manualTime.Value.match(/(.{5}$)/)[0]
				};
			}
			// check if device is weather
			if(device.device === this.data_weather){
				this.sprinklers.weather = device.readings;
			}
			// check if device is smart sprinkler
			if(device.device === this.data_smartSprinkler){
				this.sprinklers.smart = device.readings;
			}
		}
	}

	// calc total durations
	private totalDurations() {
    	this.sprinklers.totalDuration.start1 = this.sprinklers.times.interval1[0].startTime;
    	this.sprinklers.totalDuration.end1 = this.sprinklers.times.interval1[this.sprinklers.times.interval1.length - 1].endTime;
    	this.sprinklers.totalDuration.start2 = this.sprinklers.times.interval2[0].startTime;
    	this.sprinklers.totalDuration.end2 = this.sprinklers.times.interval2[this.sprinklers.times.interval2.length - 1].endTime;
    	this.sprinklers.totalDuration.duration1 = this.time.duration(this.sprinklers.totalDuration.start1, this.sprinklers.totalDuration.end1).time;
    	this.sprinklers.totalDuration.duration2 = this.time.duration(this.sprinklers.totalDuration.start2, this.sprinklers.totalDuration.end2).time;
    }

	// calc days and reformat
	private days(weekdays) {
        let days = [], arr = [], allDays = false;
        weekdays = typeof weekdays === 'number' ? weekdays.toString() : weekdays;
        for (let i = 0; i < weekdays.length; i++) {
            days.push(weekdays.slice(i, i + 1));
            if (weekdays[i] === '1') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.MONDAY'));
            }
            if (weekdays[i] === '2') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.TUESDAY'));
            }
            if (weekdays[i] === '3') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.WEDNESDAY'));
            }
            if (weekdays[i] === '4') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.THURSDAY'));
            }
            if (weekdays[i] === '5') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.FRIDAY'));
            }
            if (weekdays[i] === '6') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.SATURDAY'));
            }
            if (weekdays[i] === '0') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.SUNDAY'));
            }
        }
        for (let k = 0; k < arr.length - 2; k++) {
            arr[k] = arr[k] + ', ';
        }
        arr[arr.length - 2] = arr[arr.length - 2] + ' ' + this.translate.instant('GENERAL.DICTIONARY.AND') + ' ';
        if (weekdays.length === 7) {allDays = true; }
        return { days, textDays: arr, fhemDays: weekdays, allDays};
    }

    private detectNextTimes() {
    	this.sprinklers.times.next = [];
    	const local = this.time.local().timeMin;
    	for (let i = 0; i < this.sprinklers.states.length; i++) {
    		this.sprinklers.times.next.push({
                startTime: '',
                endTime: '',
                duration: ''
            });
    		const start1 = this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin;
    		const start2 = this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin;
    		const end1 = this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin;
    		const end2 = this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin;
    		if (!this.sprinklers.smart.enableInterval2.Value) {
    			this.sprinklers.times.next[i].startTime = this.checkForDay(i, 1, this.sprinklers.times.interval1[i].smartStart);
       			this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval1[i].smartEnd;
       			this.sprinklers.times.next[i].duration = this.sprinklers.times.interval1[i].smartDuration;
    		} else {
    			if (local >= end1 ) {
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

    private checkForDay(index, interval, value) {
    	// check if current day is inserted
    	const currentDay = this.time.local().weekday;
    	const fhemDays = this.sprinklers.times['interval' + interval][index].days.fhemDays;
    	return (fhemDays.indexOf(currentDay.toString()) !== -1) ? value : false;
    }

    private initTimeLine() {
    	this.timeArr = [];
    	for (let i = 0; i < this.sprinklers.states.length; i++) {
    		this.timeArr.push({
    			start1: {min: this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin, time: this.sprinklers.times.interval1[i].smartStart},
    			end1: {min: this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin, time: this.sprinklers.times.interval1[i].smartEnd},
	  			duration1: {min: this.time.times(this.sprinklers.times.interval1[i].smartDuration).toMin, time: this.sprinklers.times.interval1[i].smartDuration},
	  			start2: {min: this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin, time: this.sprinklers.times.interval2[i].smartStart},
    			end2: {min: this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin, time: this.sprinklers.times.interval2[i].smartEnd},
	  			duration2: {min: this.time.times(this.sprinklers.times.interval2[i].smartDuration).toMin, time: this.sprinklers.times.interval2[i].smartDuration},
    		});
    		this.arrangeDays(this.timeArr[i].start1.min, this.timeArr[i].duration1.min, this.timeArr[i].end1.min, 'inter1', i);
  			this.arrangeDays(this.timeArr[i].start2.min, this.timeArr[i].duration2.min, this.timeArr[i].end2.min, 'inter2', i);
    	}
    	this.local.percentage = ((this.time.local().timeMin / 1440) * 100) + '%';
    }

    private arrangeDays(start, duration, end, inter, index) {
		const interval = (inter === 'inter1') ? 1 : 2;
  		const Interval = (inter === 'inter1') ? 'interval1' : 'interval2';
  		const days = this.sprinklers.times[Interval][index].days.days;
  		for (let i = 0; i < days.length; i++) {
  			let day: any = days[i];
  			// sunday = 0 fix
  			if (parseInt(day) === 0) { day = 7; }
  			this.calendarPercentage(start, end, duration, inter, index, day);
  		}
	}

	private calendarPercentage(start, end, duration, inter, index, dayPick) {
  		const interval = (inter === 'inter1') ? 1 : 2;
  		let day = parseInt(dayPick);
  		if (start > end) {
  			// sunday = 0 fix
  			if (day === 0) { day = 7; }
  			// from 00:00 is arranged to next day
  			let nextD = day + 1;
  			if (day === 7) {nextD = 1; }
  			this.timeArr[index]['startFromNullP_' + interval + '_' + nextD] = '0%';
  			this.timeArr[index]['heightFromNullP_' + interval + '_' + nextD] = ((duration - (1440 - start)) / 1440) * 100 + '%';
  		}
  		this.timeArr[index]['startP_' + interval + '_' + day] = ((start / 1440) * 100) + '%';
  		this.timeArr[index]['heightP_' + interval + '_' + day] = (duration / 1440) * 100 + '%';
  	}

  	// display of sprinkler sub titles
  	public subTitleResolver(i) {
    	const text = (this.sprinklers.states[i].callback ?
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.CURRENT') :
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.NEXT')
    	);
  		let result;
  		let smartCond = null;
  		if (this.sprinklers.smart.enabled && this.sprinklers.smart.rain && this.sprinklers.weather.tooRainy && this.sprinklers.smart.wind && this.sprinklers.weather.tooWindy) {
  			smartCond = ( this.sprinklers.smart.enabled.Value ?
	  			( JSON.parse(this.sprinklers.smart.rain.Value) && JSON.parse(this.sprinklers.weather.tooRainy.Value) ?
	  				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_RAINY') :
	  				( JSON.parse(this.sprinklers.smart.wind.Value) && JSON.parse(this.sprinklers.weather.tooWindy.Value) ?
	  					this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_WINDY')  : null
	  				)
	  			) : null
	  		);
  		}
  		if (this.sprinklers.smart.winterMode.Value) {
  			result = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE') + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.CAN_NOT_START.INFO');
  		} else {
  			if (smartCond !== null) {
  				result = smartCond;
  				if (this.sprinklers.times.manual[i].startTime !== '00:00') {
  					result = text + this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:30)';
  				}
  			} else {
  				result = text + ( this.sprinklers.times.manual[i].startTime !== '00:00' ?
  					this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:30)' :
  					(this.sprinklers.times.next[i].startTime ?
  						this.sprinklers.times.next[i].startTime + ' - ' + this.sprinklers.times.next[i].endTime + ' (' + this.sprinklers.times.next[i].duration + ')' :
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.NOT_TODAY')
  					)
  				);
  			}
  		}
  		return result;
    }

  	// toggle all sprinklers
  	toggleAll(state: boolean){
  		if (!this.checkWinter()) {
  			if (!state) {
  				this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'true');
  			} else {
  				this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'false');
  			}
  		}
  		this.native.nativeClickTrigger();
  	}

  	// toggle single sprinkler
  	toggle(state: boolean, index: number){
  		if (!this.checkWinter()) {
  			if (!state) {
  				if (this.sprinklers.smart.runInterval.Value) {
  					this.showAlert(
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.INFO')
  					);
  				}else{
  					// resetting other manual times
  					for (let i = 0; i < this.sprinklers.states.length; i++) {
  						if (this.sprinklers.times.manual[i].startTime !== '00:00') {
  							this.fhem.setAttr(this.data_device[i], 'manualTime', '00:00-00:00');
  						}
  					}
  					this.fhem.setAttr(this.data_device[index], 'manualTime', this.time.local().time + '-' + this.time.calcEnd(this.time.local().timeMin, 30));
  					this.fhem.setAttr(this.data_smartSprinkler, 'manualMode', 'true');
  				}
  			}else{
  				this.fhem.set(this.data_device[index], 'false');
  			}
  		}
    	this.native.nativeClickTrigger();
  	}

  	private checkWinter() {
  		if (this.sprinklers.smart.winterMode.Value) {
    		this.showAlert(
    			this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
    			this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE') + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.CAN_NOT_START.INFO')
    		);
    		return true;
    	} else {
    		return false;
    	}
  	}

  	private showAlert(head, para) {
  		this.toast.showAlert(head, para, false);
    }

    // change smart sprikler configs
    changeSmartSetting(setting: string, value: any){
    	this.fhem.setAttr(this.data_smartSprinkler, setting, value);
    }

  	// open settings menu
  	openSettings(menu: string){
  		this.menus[menu] = !this.menus[menu];
      this.native.nativeClickTrigger();
  	}

  	// edit mailing
  	editMail(text: string){
  		this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.CHANGE'),
    		text,
    		{
    			inputs: [{
	    			name: 'newName',
	    			placeholder: this.formatMail(this.sprinklers.smart.mail.Value, 'display')
	    		}],
	    		buttons: [
	    			{
	    				text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
	    				role: 'cancel'
	    			},
	    			{
	                    text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
	                    handler: data => {
	                        // await this.inputMail(data.newName);
	                        if (!this.testMail(data.newName)) {
	                        	this.editMail(
	                        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.TITLE') + ' ' + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.INFO')
	                        	);
	                        } else {
	                        	this.changeSmartSetting('mail', this.formatMail(data.newName, 'fhem'));
	                        }
	                    }
	                }
	    		]
    		}
    	);
  	}

  	// test mail config
  	private testMail(mail) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return (re.test(String(mail).toLowerCase())) ? true : false;
	}

	// format mail to needs
	public formatMail(mail: string, condition: string) {
        // formatting mail for fhem or for user display
        if (condition === 'display') {
            const index = mail.indexOf('\\');
            return this.replaceAt(mail, index, '');
        }
        if (condition === 'fhem') {
            const index = mail.indexOf('@');
            return this.replaceAt(mail, index, '\\@');
        }
    }

    private replaceAt(string: string, index: number, replacement: any) {
        return string.substr(0, index) + replacement + string.substr(index + 1);
    }

    // update colors for sprinkler
    updateSprinklerColor(){
    	this.storage.changeSetting({name: 'sprinklerColors',change: JSON.stringify(this.sprinklerColors)});
    	this.native.nativeClickTrigger();
    }

    // show runtime from timeline
    showRuntime(i: number){
    	let message = '', head = '';
  		const time = this.timeArr[i];
  		if (this.sprinklers.smart.winterMode.Value) {
  			head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE');
  			message = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.INFO');
  		} else {
  			const inter2 = (this.sprinklers.smart.enableInterval2.Value) ? time.start2.time + ' - ' + time.end2.time + ' (' + time.duration2.time + ')' : this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.DEACTIVATED');
  			head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME') + this.sprinklers.names[i];
  			message = '<h2>Interval 1:</h2>' + time.start1.time + ' - ' + time.end1.time + ' (' + time.duration1.time + ')<br><br>' + '<h2>Interval 2:</h2>' + inter2;
  		}
  		this.showAlert(head, message);
    }

    // change settings
    // change sprinkler name
    editName(index: number) {
    	this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.NAME.CHANGE'),
    		'',
    		{
    			inputs: [{
			      	name: 'newName',
			      	placeholder: this.sprinklers.names[index]
			    }],
			    buttons: [
			    	{
			      		text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
			      		role: 'cancel'
			      	},
			      	{
			      		text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
			      		handler: data => {
			      			let naming = data.newName.replace(/ä/g, 'Ã¤').replace(/ö/g, 'Ã¶').replace(/ü/g, 'Ã¼').replace(/ß/g, 'Ã');
			      			naming = (naming === '') ? this.sprinklers.names[index] : naming;
			      			if (naming !== this.sprinklers.names[index]) {
			      				this.fhem.setAttr(this.data_device[index], 'name', naming);
			      			}
			      		}
			      	}
			    ]
    		}
    	);
    }

    // change weekdays
    public changeWeekdays(values, index: string, inter: string) {
    	const i = (inter === 'inter1') ? '1' : '2';
     	if (values.detail.value.join('') !== this.sprinklers.times['interval' + i][index].days.fhemDays) {
        	const sprinkler = (inter === 'inter1') ? this.sprinklers.times.interval1[index] : this.sprinklers.times.interval2[index];
        	this.fhem.setAttr(this.data_device[index], 'days' + i, values.detail.value.join(''));
        }
    }

    // change time 
    setEnd(device: string, index: number, start: string, duration: string, inter: string) {
    	const endTime: string = this.time.minToTime(this.time.times(start).toMin + this.time.times(duration).toMin);
    	const testSorting: boolean = this.checkWrongSorting(start, inter);
    	if (!testSorting) {
    		const testCollide: boolean = this.checkCollide(start, endTime, inter);
    		if (!testCollide) {
    			const sprinkler = (inter === 'inter1') ? this.sprinklers.times.interval1[index] : this.sprinklers.times.interval2[index];
    			const interval = (inter === 'inter1') ? 'interval1' : 'interval2';
    			this.fhem.setAttr(device, interval, start + '-' + endTime);
    		}
    	}
    	this.native.nativeClickTrigger();
    }

    private checkWrongSorting(start: string, inter: string) {
        const start1 = (inter === 'inter1') ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval1[0].startTime).toMin;
        const start2 = (inter === 'inter2') ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval2[0].startTime).toMin;
        if (start2 <= start1) {
        	this.showAlert(
        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.TITLE'),
        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.INFO')
        	);
         	return true;
        } else {
            return false;
        }
    }

    private checkCollide(start, end, inter) {
        const Ythis = this;
        let collideSum = 0;
        const sprinkler = this.sprinklers.times;
        const start1 = (inter === 'inter1') ? this.time.times(start).toMin : this.time.times(sprinkler.interval1[0].startTime).toMin;
        const start2 = (inter === 'inter2') ? this.time.times(start).toMin : this.time.times(sprinkler.interval2[0].startTime).toMin;
        const end1 = (inter === 'inter1') ? predictEnd(inter) : this.time.times(sprinkler.interval1[sprinkler.interval1.length - 1].endTime).toMin;
        const end2 = (inter === 'inter2') ? predictEnd(inter) : this.time.times(sprinkler.interval2[sprinkler.interval2.length - 1].endTime).toMin;
        function predictEnd(inter) {
            // adding durations of user to start of interval, to return endTime (which will be setted)
            let totalDuration = 0;
            for (let i = 0; i < sprinkler.interval1.length; i++) {
                const dur = (inter === 'inter1') ? Ythis.time.times(sprinkler.interval1[i].duration).toMin : Ythis.time.times(sprinkler.interval2[i].duration).toMin;
                totalDuration = totalDuration + dur;
            }
            totalDuration = totalDuration + (sprinkler.interval1.length - 1);
            return (inter === 'inter1') ? Ythis.time.times(Ythis.time.minToTime(start1 + totalDuration)).toMin : Ythis.time.times(Ythis.time.minToTime(start2 + totalDuration)).toMin;
        }
        const collideVals = this.time.checkTimeCollide([
            {start: start1, end: end1},
            {start: start2, end: end2}
        ], true);
        for (let i = 0; i < collideVals.length; i++) {
            collideSum = collideSum + collideVals[i];
        }
        if (!this.sprinklers.smart.enableInterval2.Value) {
            return false;
        }
        if (collideVals[0] > 0) {
            if (inter === 'inter2') {
                this.optimalStart('inter2', collideVals[0], start2, 0, 'start2end1');
            } else {
                this.optimalStart('inter1', collideVals[0], start1, 1, 'start2end1');
            }
            return true;
        }
        if (collideVals[1] > 0) {
            if (inter === 'inter1') {
                this.optimalStart('inter1', collideVals[1], start1, 1, 'end2start1');
            } else {
                this.optimalStart('inter2', collideVals[1], start2, 0, 'end2start1');
            }
            return true;
        }
        if (collideSum === 0) {
            return false;
        }
    }

    private optimalStart(inter, val, startmin, index, condition) {
        let optimalStart;
        if (condition === 'start2end1') {
            optimalStart = (inter === 'inter1') ? this.time.minToTime(startmin - val - 1) : this.time.minToTime(startmin + val + 1);
        }
        if (condition === 'end2start1') {
            optimalStart = (inter === 'inter1') ? this.time.minToTime(startmin + val + 1) : this.time.minToTime(startmin - val - 1);
        }
        if (index === 0) {
            this.optimalAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.OPTIMAL.INTERVAL_2') + optimalStart, optimalStart, inter);
        }if (index === 1) {
            this.optimalAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.OPTIMAL.INTERVAL_1') + optimalStart, optimalStart, inter);
        }
    }

    private optimalAlert(message, start, inter) {
    	this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.TITLE'),
    		message + ' ' + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.INFO'),
    		[
    			{
    				text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
    				role: 'cancel'
    			},
    			{
    				text: this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.BUTTONS.CONFIRM'),
    				handler: data => {
    					this.setEnd(
    						this.sprinklers.times[(inter === 'inter1' ? 'interval1' : 'interval2')][0].device, 0, start,
    						this.sprinklers.times[(inter === 'inter1' ? 'interval1' : 'interval2')][0].duration, inter
    					);
    				}
    			}
    		]
    	);
    }

	ngOnDestroy(){
		// combine all gedives for request
		let requestArr = JSON.parse(JSON.stringify(this.data_device));
		requestArr.push(this.data_weather, this.data_smartSprinkler);

		// remove all devices from listener
		requestArr.forEach((device: string)=>{
			this.fhem.removeDevice(this.ID + device);
		});
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private time: TimeService,
		private translate: TranslateService,
		private storage: StorageService,
		private toast: ToastService,
    	private native: NativeFunctionsService) {}

	static getSettings() {
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
	imports: [ComponentsModule, IonicModule, TranslateModule],
  	declarations: [FhemSprinklerComponent]
})
class FhemSprinklerComponentModule {}