import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Subscription } from 'rxjs';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

@Component({
	selector: 'timepicker',
	template: `
		<div *ngIf="!customMode"
			[ngClass]="settings.app.theme"
			class="timepicker" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="100"
			minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex, 'border-bottom': (bool_data_showBorder) ? '1px solid #ddd' : '0px'}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<ng-container *ngTemplateOutlet="timepicker"></ng-container>
			</fhem-container>
		</div>
		<div 
			*ngIf="customMode" 
			class="timepicker-custom"
			[ngClass]="settings.app.theme"
			[ngStyle]="{
				'height': fixBtnHeight ? '100%' : '50px'
			}">
			<ng-container *ngTemplateOutlet="timepicker"></ng-container>
		</div>

		<ng-template #timepicker>
			<button class="btn" (click)="datetime.open()" matRipple [matRippleColor]="'#d4d4d480'">
				<ion-label class="label">{{label}}</ion-label>
				<ion-datetime #datetime class="time"
					[displayFormat]="format"
					[pickerFormat]="format"
					[(ngModel)]="value"
					[cancelText]="cancelBtn"
					[doneText]="confirmBtn"
					[hourValues]="timeVals.hours"
					[minuteValues]="timeVals.mins"
					(ionChange)="updateTime($event)">
				</ion-datetime>
			</button>
		</ng-template>
	`,
	styles: [`
		.timepicker{
			position: absolute;
			width: 100px;
			height: 40px;
		}
		.timepicker-custom{
			position: relative;
			width: 100%;
			border-bottom: 1px solid var(--dark-border);
		}
		.btn{
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}
		button{
			background: transparent;
		}
		button:focus{
			outline: 0px;
		}
		.label,
		.time{
			position: absolute;
			top: 50%;
			transform: translate3d(0,-50%,0);
			color: #000;
			font-size: 16px;
			font-weight: 500;
			margin: 0;
		}
		.label{
			left: 0;
			margin-left: 8px;
		}
		.time{
			right: 0;
			margin-right: 8px;
		}
		ion-datetime{
			z-index: -1;
		}

		.dark .label,
		.dark .time{
			color: var(--dark-p);
		}
	`],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: TimepickerComponent, multi: true}]
})

export class TimepickerComponent implements OnInit, OnDestroy, ControlValueAccessor {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private native: NativeFunctionsService) {
	}

	// ControlValueAccessor
	@Input() customMode = false;
	@Input() actOnCallback = false;
	@Input() label = '';
	@Input() confirmBtn = 'Bestätigen';
	@Input() cancelBtn = 'Abbrechen';
	@Input() format = 'HH:mm';
	@Input() maxHours = '24';
	@Input() maxMinutes = '60';
	// set the button height to parent defenition instead of 50px --> .timepicker-custom
	@Input() fixBtnHeight: boolean = false;

	// Component ID
	@Input() ID: number;
	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	// Popup information
	@Input() inPopup = false;

	public fhemDevice: any;
	// fhem event subscribtions
    private deviceChange: Subscription;

    // FHEM Device Inputs
    @Input() data_device: string;
    @Input() data_reading: string;
    @Input() data_setReading: string;

    @Input() data_maxHours: string;
    @Input() data_maxMinutes: string;

    @Input() data_confirmBtn: string;
    @Input() data_cancelBtn: string;

    @Input() data_label = '';

    @Input() arr_data_format: Array<any>;

    @Input() bool_data_showBorder: boolean;

    public value: string;
    // Value to act on Callback
    private currentValue: string;

    public timeVals: any = {hours: '', mins: ''};

    @Output() onTimeChange: EventEmitter<any> = new EventEmitter();


	static getSettings() {
		return {
			name: 'Time Picker',
			component: 'TimepickerComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_label', default: ''},
				{variable: 'data_confirmBtn', default: 'Bestätigen'},
				{variable: 'data_cancelBtn', default: 'Abbrechen'},
				{variable: 'data_maxHours', default: '24'},
				{variable: 'data_maxMinutes', default: '60'},
				{variable: 'arr_data_format', default: 'HH:mm,HH,mm'},
				{variable: 'bool_data_showBorder', default: true}
			],
			dimensions: {minX: 100, minY: 40}
		};
	}

	onTouched: () => void = () => {};
  	onChange: (_: any) => void = (_: any) => {};
  	updateChanges() {this.onChange(this.value); }
  	registerOnChange(fn: any): void {this.onChange = fn; }
  	registerOnTouched(fn: any): void {this.onTouched = fn; }
  	writeValue(value: any): void {
  		if (value !== null) {
  			this.value = value;
  			if (this.actOnCallback) {this.currentValue = this.value; }
  			this.updateChanges();
  		}
  	}

	ngOnInit() {
		if (!this.customMode) {
			this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
				this.fhemDevice = device;
				if (device) {
					this.value = this.fhemDevice.readings[this.data_reading].Value;
					this.deviceChange = this.fhem.devicesSub.subscribe(next => {
					  	this.listen(next);
					});
				}
			});
		}
		this.initPicker();
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (this.data_reading in update.change.changed) {
				this.value = update.change.changed[this.data_reading];
				this.currentValue = this.value;
			}
		}
	}

	private initPicker() {
		this.label = (!this.customMode) ? (this.data_label === '' ? this.data_device : this.data_label) : this.label;
		this.confirmBtn = (!this.customMode) ? (this.data_confirmBtn === '' ? this.confirmBtn : this.data_confirmBtn) : this.confirmBtn;
		this.cancelBtn = (!this.customMode) ? (this.data_cancelBtn === '' ? this.cancelBtn : this.data_cancelBtn) : this.cancelBtn;
		this.format = (!this.customMode) ? (this.arr_data_format[0] === '' ? this.format : this.arr_data_format[0]) : this.format;

		this.maxHours = (!this.customMode) ? (this.data_maxHours === '' ? this.maxHours : this.data_maxHours) : this.maxHours;
		this.maxMinutes = (!this.customMode) ? (this.data_maxMinutes === '' ? this.maxMinutes : this.data_maxMinutes) : this.maxMinutes;

		this.currentValue = this.value;
		// Max Times
		const arr1 = [];
		const arr2 = [];
		for (let i = 0; i < Math.max(parseInt(this.maxHours), parseInt(this.maxMinutes)); i++) {
			if (i < parseInt(this.maxHours)) {
				arr1.push(this.numFormatter(i));
			}
			if (i < parseInt(this.maxMinutes)) {
				arr2.push(this.numFormatter(i));
			}
		}
		this.timeVals.hours = arr1;
		this.timeVals.mins = arr2;
	}

	private numFormatter(num) {
		return (num < 10) ? '0' + num.toString() : num.toString();
	}

	public updateTime(val) {
		if (!this.actOnCallback) {
			this.currentValue = val.detail.value;
			this.onTimeChange.emit(val.detail.value);
			if (this.fhemDevice) {
				this.sendValue(val.detail.value);
			}
		} else {
			setTimeout(() => {
				if (this.currentValue) {
					this.value = this.currentValue;
				}
			});
			// Detect change
			if (this.currentValue !== val.detail.value) {
				this.onTimeChange.emit(val.detail.value);
			}
		}
	}

	private sendValue(val) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
		} else {
			this.fhem.set(this.fhemDevice.device, val);
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy() {
		if (this.deviceChange !== undefined) {
			this.deviceChange.unsubscribe();
		}
	}
}
