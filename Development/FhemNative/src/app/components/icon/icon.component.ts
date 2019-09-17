import { Component, Input, OnInit } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-icon',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="icon"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="30"
			minimumHeight="30"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true, 'offline': true}">
				<div
				class="icon-container">
					<ion-icon
						[name]="(fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)"
						[ngStyle]="{'color': (fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? style_iconColorOn : style_iconColorOff) : style_iconColorOn )}">
					</ion-icon>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.icon{
			position: absolute;
    		width: 40px;
    		height: 40px;
		}
		.icon-container{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		.icon-container ion-icon{
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate3d(-50%, -50%,0);
			width: inherit;
			height: inherit;
			transition: all .2s ease;
		}
	`]
})
export class IconComponent implements OnInit {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService) {}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;

	// Icon
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

	static getSettings() {
		return {
			name: 'Icon',
			component: 'IconComponent',
			type: 'fhem',
			container: false,
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'}
			],
			dimensions: {minX: 40, minY: 40}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
		});
	}
}
