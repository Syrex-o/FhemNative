import { Component, Input, OnInit } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';

@Component({
	selector: 'fhem-button',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="fhem-btn"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="30"
			minimumHeight="30"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true, connected: true}">
				<button
					matRipple [matRippleColor]="'#d4d4d480'"
					class="btn"
					(click)="sendCmd()"
					[ngStyle]="{
						'background-color': style_buttonColor,
						'border-radius.px': data_borderRadius
					}">
					<p *ngIf="!bool_data_iconOnly" class="label" [ngStyle]="{'color': style_labelColor}">{{data_label}}</p>
					<ion-icon
						*ngIf="settings.iconFinder((fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)).type === 'ion'"
						[name]="(fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)"
						[ngClass]="bool_data_iconOnly ? 'icon-only' : 'icon-text'"
						[ngStyle]="{'color': (fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? style_iconColorOn : style_iconColorOff) : style_iconColorOn ), 'font-size.px': data_iconSize }">
					</ion-icon>
					<fa-icon
						*ngIf="settings.iconFinder((fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)).type != 'ion'"
						[icon]="[settings.iconFinder((fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)).type, (fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)]"
						[ngClass]="bool_data_iconOnly ? 'icon-only' : 'icon-text'"
						[ngStyle]="{'color': (fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? style_iconColorOn : style_iconColorOff) : style_iconColorOn ), 'font-size.px': data_iconSize }">
					</fa-icon>
				</button>
			</fhem-container>
		</div>
	`,
	styles: [`
	.fhem-btn{
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
	.label{
		font-size: 16px;
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translate3d(0,-50%,0);
		margin: 0;
		font-weight: 600;
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
	.btn:focus{
		outline: 0px;
	}
	.btn:active{
		box-shadow: 0 0px 0px 0 rgba(0,0,0,.05), 0 0px 0px 0 rgba(0,0,0,.05), 0 0px 0px 0 rgba(0,0,0,.05);
	}
	`]
})

export class ButtonComponent implements OnInit {

	constructor(
		public fhem: FhemService,
		public settings: SettingsService) {}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_setOn: string;
	@Input() data_setOff: string;
	@Input() data_sendCommand: string;
	@Input() data_label: string;
	@Input() data_borderRadius: string;
	@Input() data_iconSize: string;

	// Icon
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;
	@Input() style_buttonColor: string;
	@Input() style_labelColor: string;

	@Input() bool_data_iconOnly: boolean;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;


	static getSettings() {
		return {
			name: 'Button',
			component: 'ButtonComponent',
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
				{variable: 'data_sendCommand', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_iconSize', default: '20'},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'bool_data_iconOnly', default: false},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_buttonColor', default: '#86d993'},
				{variable: 'style_labelColor', default: '#fff'}
			],
			dimensions: {minX: 30, minY: 30}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.data_label = (this.data_label && this.data_label !== '') ? this.data_label : this.fhemDevice.device;
			}
		});
	}

	public sendCmd() {
		if (this.data_sendCommand === '') {
			if (this.fhemDevice) {
				const command = (this.fhemDevice.readings[this.data_reading].Value.toString() === this.data_getOn) ? this.data_setOff : this.data_setOn;
				if (this.data_setReading !== '') {
					this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
				} else {
					this.fhem.set(this.fhemDevice.device, command);
				}
			}
		} else {
			this.fhem.sendCommand({command: this.data_sendCommand});
		}
	}
}
