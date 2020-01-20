import { Component, Input, OnInit, ElementRef, HostListener } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

@Component({
	selector: 'fhem-circle-menu',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="circle-menu" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="40"
			minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<div
					class="circle-menu-container"
					[ngClass]="arr_data_expandStyle[0]">
					<button class="btn circle" matRipple [matRippleColor]="'#d4d4d480'" (click)="show = !show;">
						<ion-icon class="circle" [name]="icon_icon"></ion-icon>
					</button>
					<div class="circle-menu-items" [ngClass]="show ? 'show' : 'hide'">
						<div
							class="circle-menu-item"
							*ngFor="let item of items; let i = index"
							matRipple [matRippleColor]="'#d4d4d480'"
							(click)="select(i)"
							[ngStyle]="{
								'transform': show ? translator(arr_data_expandStyle[0], i) : 'translate(0px,0px)',
								'opacity': show ? 1 : 0,
								'transition-delay': show ? (i * 0.04)+'s' : '0s'
							}">
							<p class="circle">{{item}}</p>
						</div>
					</div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.circle-menu{
			position: absolute;
			width: 40px;
			height: 40px;
		}
		.circle-menu-container{
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}
		.btn{
			position: relative;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background: transparent;
			z-index: 1;
			padding: 0;
			box-shadow: 0 3px 6px 0 rgba(0,0,0,.1), 0 1px 3px 0 rgba(0,0,0,.08);
		}
		.btn:focus{
			outline: 0px;
		}
		ion-icon{
			width: 100%;
			height: 100%;
		}
		.circle-menu-items{
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
			width: 40px;
			height: 40px;
		}
		.circle-menu-item{
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: #fff;
			position: absolute;
			transition: all .3s cubic-bezier(0.50, -1, 0.50, 2);
			transform: translate(0px,0px);
			z-index: 0;
			overflow: hidden;
			border: 1px solid #3e3e3e;
			box-shadow: 0 3px 6px 0 rgba(0,0,0,.1), 0 1px 3px 0 rgba(0,0,0,.08);
		}
		p{
			position: absolute;
			margin: 0;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
		}

		.dark ion-icon,
		.dark p{
			color: var(--dark-p);
		}
		.dark .circle-menu-item{
			background: var(--dark-bg-dark);
		}
	`]
})
export class CircleMenuComponent implements OnInit {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private ref: ElementRef,
		private native: NativeFunctionsService) {
	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;

	@Input() arr_data_expandStyle: string|string[];

	@Input() data_value1: string;
	@Input() data_value2: string;
	@Input() data_value3: string;
	@Input() data_value4: string;
	@Input() data_value5: string;
	@Input() data_value6: string;

	@Input() icon_icon: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

	public items: Array<any> = [];
	public show = false;

	static getSettings() {
		return {
			name: 'Circle Menu',
			component: 'CircleMenuComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_value1', default: ''},
				{variable: 'data_value2', default: ''},
				{variable: 'data_value3', default: ''},
				{variable: 'data_value4', default: ''},
				{variable: 'data_value5', default: ''},
				{variable: 'data_value6', default: ''},
				{variable: 'arr_data_expandStyle', default: 'top,left,bottom,right,circle'},
				{variable: 'icon_icon', default: 'add-circle'}
			],
			dimensions: {minX: 40, minY: 40}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			for (let i = 1; i <= 6; i++) {
				if (this['data_value' + i] !== '') {
					this.items.push(this['data_value' + i]);
				}
			}
		});
	}

	@HostListener('document:click', ['$event'])onClick(event) {
		if (this.show) {
			if (event.target.className.indexOf('circle') === -1) {
				this.show = false;
			}
		}
	}

	public translator(style, index) {
		let translate;
		if (style === 'top') {
			translate = 'translate3d(0px,' + ((45 * (index + 1)) * -1) + 'px, 0px)';
		}
		if (style === 'left') {
			translate = 'translate3d(' + ((45 * (index + 1)) * -1) + 'px,0px, 0px)';
		}
		if (style === 'bottom') {
			translate = 'translate3d(0px,' + (45 * (index + 1)) + 'px, 0px)';
		}
		if (style === 'right') {
			translate = 'translate3d(' + (45 * (index + 1)) + 'px,0px, 0px)';
		}
		if (style === 'circle') {
			translate = 'rotate(' + ((360 / this.items.length) * (index + 1) - 90) + 'deg) translate3d(40px,40px,0px) rotate(' + ((-360 / this.items.length) * (index + 1) + 90) + 'deg)';
		}
		return translate;
	}

	public select(index) {
		const command = this.items[index];
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
		} else {
			this.fhem.set(this.fhemDevice.device, command);
		}
		this.native.nativeClickTrigger();
	}
}
