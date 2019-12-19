import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'switch',
	template: `
		<div
			*ngIf="!customMode"
			[ngClass]="settings.app.theme"
			class="toggle"
			resize
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			minimumWidth="100" minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<ng-container *ngTemplateOutlet="switch"></ng-container>
			</fhem-container>
		</div>
		<div *ngIf="customMode" class="customMode" [ngClass]="settings.app.theme">
			<ng-container *ngTemplateOutlet="switch"></ng-container>
		</div>

		<ng-template #switch>
			<div class="toggle-container" [ngStyle]="{'border-bottom': (!customMode && bool_data_showBorder) ? '1px solid #ddd' : '0px'}">
				<p [style.left]="(padding ? '8px' : '0px')" class="title">{{label}}</p>
				<p [style.left]="(padding ? '8px' : '0px')" class="subtitle" *ngIf="subTitle && subTitle !== ''">{{subTitle}}</p>
				<button
					[ngClass]="{
						'toggle-btn' : (!customMode && arr_data_buttonStyle[0] === 'toggle-outline'),
						'toggle-inline' : (customMode || (!customMode && arr_data_buttonStyle[0] === 'toggle') ),
						'toggle-btn-on' : ((customMode && value) || (!customMode && fhemDevice?.readings[data_reading].Value === data_getOn)),
						'toggle-btn-off' : ((customMode && !value) || (!customMode && fhemDevice?.readings[data_reading].Value === data_getOff))
					 }"
					[style.background]="(!customMode ? (fhemDevice?.readings[data_reading].Value === data_getOn ? style_colorOn : style_colorOff) : value ? style_colorOn : style_colorOff)"
					(click)="toggle()">
					<span
						[ngClass]="{
							'toggle-btn-inner' : (!customMode && arr_data_buttonStyle[0] === 'toggle-outline'),
							'toggle-inline-inner' : (customMode || (!customMode && arr_data_buttonStyle[0] === 'toggle') )
					}"
					[style.background]="(!customMode ? (fhemDevice?.readings[data_reading].Value === data_getOn ? style_thumbColorOn : style_thumbColorOff) : value ? style_thumbColorOn : style_thumbColorOff)">
					</span>
				</button>
			</div>
		</ng-template>
	`,
	styles: [`
		.dark p{
		    color: var(--dark-p);
		}
		.toggle{
		    position: absolute;
		    left: 0;
		    width: 100px;
		    height: 40px;
		}
		.toggle-container{
			position: relative;
			width: 100%;
			height: 100%;
		}
		p{
			position: absolute;
			left: 8px;
			margin: 0;
			font-weight: 500;
		}
		.toggle p{
			top: 50%;
			transform: translateY(-50%);
		}
		.toggle-btn {
		    display: inline-block;
		    outline: 0;
		    width: 4.5em;
		    height: 2.5em;
		    position: absolute;
		    cursor: pointer;
		    user-select: none;
		    border-radius: 2em;
		    padding: 2px;
		    transition: all 0.4s ease;
		    border: 1px solid #e8eae9;
		    right: 8px;
		    top: 50%;
		    transform: translate3d(0,-50%,0);
		}
		button:focus {
			outline: 0;
			transition: all .3s ease;
		}
		.toggle-btn .toggle-btn-inner {
		    left: 0;
		    position: relative;
		    display: block;
		    content: '';
		    width: 50%;
		    height: 100%;
		    border-radius: 2em;
		    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1),0 4px 0 rgba(0, 0, 0, 0.08);
		}
		.toggle-btn.toggle-btn-on .toggle-btn-inner,
		.toggle-inline.toggle-btn-on .toggle-inline-inner {
		    left: 50%;
		}
		.toggle-inline{
			position: absolute;
			top: 50%;
			transform: translate3d(0,-50%,0);
			right: 8px;
			width: 36px;
			height: 14px;
		    border-radius: 2em;
		}
		.toggle-inline-inner{
			position: absolute;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			left: 0;
			top: 50%;
			transform: translate3d(0,-50%,0);
			box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
			transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}
		.customMode{
			position: relative;
			left: 0;
		    width: 100%;
		    min-height: 40px;
		}
		.subtitle{
			font-size: .8em;
			max-width: calc(100% - 60px);
			color: var(--p-small) !important;
			font-weight: 400;
			margin-bottom: 5px;
			margin-top: 5px;
		}
		.customMode p{
			position: relative;
		}
	`],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SwitchComponent, multi: true}]
})
export class SwitchComponent implements OnInit, ControlValueAccessor {


	constructor(
		public settings: SettingsService,
		private fhem: FhemService) {

	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_setOn: string;
	@Input() data_setOff: string;
	@Input() data_label: string;
	@Input() bool_data_showBorder: boolean;
	@Input() arr_data_buttonStyle: string|string[];
	// Style
	@Input() style_colorOn = '#2994b3';
	@Input() style_colorOff = '#a2a4ab';
	@Input() style_thumbColorOn = '#14a9d5';
	@Input() style_thumbColorOff = '#fff';
	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	// Custom Switch information
    @Input() customMode = false;
    public value = false;
    @Input() actOnCallback = false;
    @Input() label: string;
    @Input() subTitle: string;
    @Input() padding = true;

  	@Output() onToggle = new EventEmitter();

  	public fhemDevice: any;

	static getSettings() {
		return {
			name: 'Switch',
			component: 'SwitchComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_setOn', default: 'on'},
				{variable: 'data_setOff', default: 'off'},
				{variable: 'data_label', default: ''},
				{variable: 'bool_data_showBorder', default: true},
				{variable: 'arr_data_buttonStyle', default: 'toggle,toggle-outline'},
				{variable: 'style_colorOn', default: '#2994b3'},
				{variable: 'style_colorOff', default: '#a2a4ab'},
				{variable: 'style_thumbColorOn', default: '#14a9d5'},
				{variable: 'style_thumbColorOff', default: '#fff'}
			],
			dimensions: {minX: 100, minY: 40}
		};
	}

    onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
  	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value) {
		this.value = value;
		this.updateChanges();
	}

	ngOnInit() {
		if (!this.customMode) {
			this.fhemDevice = null;
			this.fhem.getDevice(this.data_device, this.data_reading).then((device: any) => {
				this.fhemDevice = device;
				if (device) {
					this.label = (this.data_label && this.data_label !== '') ? this.data_label : device.device;
				}
			});
		}
	}

	public toggle() {
		if (this.customMode) {
			if (!this.actOnCallback) {this.value = !this.value; }
			this.onToggle.emit(this.value);
			this.updateChanges();
		} else {
			const command = (this.fhemDevice.readings[this.data_reading].Value === this.data_getOn) ? this.data_setOff : this.data_setOn;
			if (this.data_setReading !== '') {
				this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
			} else {
				this.fhem.set(this.fhemDevice.device, command);
			}
		}
	}
}
