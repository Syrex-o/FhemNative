import { Component, Input, OnInit } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

@Component({
	selector: 'fhem-button-multistate',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="fhem-btn-multi"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="30"
			minimumHeight="30"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<button
					matRipple [matRippleColor]="'#d4d4d480'"
					class="btn"
					(click)="sendCmd()"
					[ngStyle]="{
						'background-color': getArrValue('arr_style_buttonColors', false),
						'border-radius.px': data_borderRadius
					}">
					<p *ngIf="!bool_data_iconOnly" class="label" [ngStyle]="{'color': getArrValue('arr_style_labelColors', false)}">{{data_label}}</p>
					<ion-icon
						*ngIf="settings.iconFinder(getArrValue('arr_icon_icons', 'add-circle')).type === 'ion'"
						[name]="getArrValue('arr_icon_icons', 'add-circle')"
						[ngClass]="bool_data_iconOnly ? 'icon-only' : 'icon-text'"
						[ngStyle]="{'color': getArrValue('arr_style_iconColors', false), 'font-size.px': data_iconSize }">
					</ion-icon>
					<fa-icon
						*ngIf="settings.iconFinder(getArrValue('arr_icon_icons', 'add-circle')).type !== 'ion'"
						[icon]="getArrValue('arr_icon_icons', 'ellipsis-h')"
						[ngClass]="bool_data_iconOnly ? 'icon-only' : 'icon-text'"
						[ngStyle]="{'color': getArrValue('arr_style_iconColors', false), 'font-size.px': data_iconSize }">
					</fa-icon>
				</button>
			</fhem-container>
		</div>
	`,
	styles: [`
	.fhem-btn-multi{
		position: absolute;
		width: 30px;
		height: 30px;
	}
	.btn{
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		box-shadow: 0 2px 8px 0 rgba(0,0,0,.05), 0 4px 8px 0 rgba(0,0,0,.05), 0 1px 2px 0 rgba(0,0,0,.05);
		transition: all .2s ease;
	}
	.btn:focus{
		outline: 0px;
	}
	.label{
		font-size: 16px;
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translate3d(0,-50%,0);
		margin: 0;
		font-weight: 600;
		transition: all .2s ease;
	}
	ion-icon,
	fa-icon{
		position: absolute;
		top: 50%;
		transition: all .2s ease;
	}
	ion-icon.icon-text,
	fa-icon.icon-text{
		right: 8px;
		transform: translate3d(0,-50%,0);
	}
	ion-icon.icon-only,
	fa-icon.icon-only{
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
	.btn:active{
		box-shadow: 0 0px 0px 0 rgba(0,0,0,.05), 0 0px 0px 0 rgba(0,0,0,.05), 0 0px 0px 0 rgba(0,0,0,.05);
	}
	`]
})

export class ButtonMultistateComponent implements OnInit {
	constructor(
		public fhem: FhemService,
		public settings: SettingsService,
		private native: NativeFunctionsService) {}

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_currentState: string;
	@Input() data_getOn: any;
	@Input() data_setOn: any;
	@Input() data_label: string;
	@Input() data_borderRadius: string;
	@Input() data_iconSize: string;

	@Input() bool_data_iconOnly: boolean;

	@Input() arr_icon_icons: string|string[];
	@Input() arr_style_iconColors: string|string[];
	@Input() arr_style_labelColors: string|string[];
	@Input() arr_style_buttonColors: string|string[];

	// Component ID
	@Input() ID: number;
	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

	static getSettings() {
		return {
			name: 'Button Multistate',
			component: 'ButtonMultistateComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_getOn', default: 'on,off'},
				{variable: 'data_setOn', default: 'on,off'},
				{variable: 'data_label', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_iconSize', default: '20'},
				{variable: 'bool_data_iconOnly', default: false},
				{variable: 'arr_icon_icons', default: 'add-circle,close-circle'},
				{variable: 'arr_style_labelColors', default: '#fff,#ddd'},
				{variable: 'arr_style_buttonColors', default: '#86d993,#272727'},
				{variable: 'arr_style_iconColors', default: '#2ec6ff,#272727'}
			],
			dimensions: {minX: 30, minY: 30}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.initStates();
			}
		});
	}

	private initStates(){
		this.data_getOn = this.data_getOn !== '' ? this.data_getOn.replace(/\s/g, '').split(',') : [''];
		this.data_setOn = this.data_setOn !== '' ? this.data_setOn.replace(/\s/g, '').split(',') : [''];
		this.data_label = (this.data_label && this.data_label !== '') ? this.data_label : this.fhemDevice.device;
	}

	// get the dedicated values from arrays
	public getArrValue(arr, def){
		// fallback if needed, to reduce errors
		let res = def ? def : (this[arr][0] ? this[arr][0] : '#ddd');
		if(this.fhemDevice){
			const value = this.fhemDevice.readings[this.data_reading].Value.toString().toLowerCase();
			const getList = this.data_getOn.map(x=> x.toString().toLowerCase());
			if(getList.includes(value)){
				if(this[arr][getList.indexOf(value)]){
					res = this[arr][getList.indexOf(value)];
				}
			}
		}
		return res;
	}

	public sendCmd(){
		if (this.fhemDevice){
			const currentCommand = this.getArrValue('data_setOn', 'unrecognized');
			if(currentCommand !== 'unrecognized'){
				const command = this.data_setOn[this.data_setOn.indexOf(currentCommand) + 1] ? this.data_setOn[this.data_setOn.indexOf(currentCommand) + 1] : this.data_setOn[0];
				if (this.data_setReading !== '') {
					this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
				} else {
					this.fhem.set(this.fhemDevice.device, command);
				}
			}
		}
		this.native.nativeClickTrigger();
	}
}