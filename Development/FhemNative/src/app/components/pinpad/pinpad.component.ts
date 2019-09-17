import { Component, Input, OnInit } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-pinpad',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="pinpad"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="200"
			minimumHeight="270"
			id="{{ID}}"
			(onResize)="resize($event)"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true}">
				<div
					class="pinpad-container">
					<div class="pinpad-valid" *ngIf="fhemDevice?.readings[data_pin]">
						<div class="pinpad-header">
							<table class="dot-container">
								<tr>
									<td *ngFor="let dot of pin; let i = index">
										<span class="dot" [ngClass]="(enteredPin.length >= i + 1 ? 'active' : 'not-active')"></span>
									</td>
								</tr>
							</table>
						</div>
						<div class="pinpad-content">
							<div class="state-container">
								<p
									*ngIf="falseCounter.toString() !== data_tries"
									[ngClass]="(fhemDevice.readings[data_reading].Value === data_getOn ? 'on' : 'off')"
									class="state">{{(fhemDevice.readings[data_reading].Value === data_getOn ? data_labelOnText: data_labelOffText)}}
								</p>
								<p
									*ngIf="falseCounter.toString() === data_tries"
									class="false-text">{{falseText}}
								</p>
							</div>
							<div class="btns" [ngClass]="btnSize">
								<table>
									<tr>
										<td *ngFor="let num of [1,2,3]">
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" (click)="enterNum(num)">{{num}}</button>
										</td>
									</tr>
									<tr>
										<td *ngFor="let num of [4,5,6]">
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" (click)="enterNum(num)">{{num}}</button>
										</td>
									</tr>
									<tr>
										<td *ngFor="let num of [7,8,9]">
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" (click)="enterNum(num)">{{num}}</button>
										</td>
									</tr>
									<tr>
										<td *ngFor="let num of [1,0,2]">
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" *ngIf="num === 1" (click)="removeNum()">
												<ion-icon name="arrow-back"></ion-icon>
											</button>
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" *ngIf="num === 0" (click)="enterNum(num)">{{num}}</button>
											<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" *ngIf="num === 2" (click)="setOn()">
												<ion-icon name="key"></ion-icon>
											</button>
										</td>
									</tr>
								</table>
							</div>
						</div>
					</div>
					<p class="error" *ngIf="!fhemDevice?.readings[data_pin]">
						{{'COMPONENTS.Pinpad.TRANSLATOR.NO_PIN_READING' | translate}}
						{{'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate}}
					</p>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.pinpad{
			position: absolute;
    		width: 200px;
    		height: 270px;
		}
		.pinpad-container{
			position: absolute;
			width: 100%;
			height: 100%;
			background: #263238;
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
		}
		.pinpad-header{
			position: absolute;
			height: 15%;
			width: 100%;
			top: 0;
		}
		.dot-container{
			height: 100%;
			width: 60%;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
		}
		td{
			position: relative;
		}
		.dot{
			width: 12px;
			height: 12px;
			background: #90a4ae;
			border-radius: 50%;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			transition: all .2s ease;
		}
		.dot.active{
			transform: scale(1.3) translate(-50%, -50%);
		}
		.pinpad-content{
			position: absolute;
			width: 100%;
			height: calc(100% - 15%);
			top: 15%;
			overflow: hidden;
		}
		.state,
		.false-text{
			font-weight: 600;
			text-align: center;
			margin: 0;
		}
		.state.off,
		.false-text{
			color: var(--btn-red);
		}
		.state.on{
			color: var(--btn-green);
		}
		.btns table{
			position: absolute;
			left: 50%;
			bottom: 20px;
			transform: translateX(-50%);
		}
		.btns.small table,
		.btns.small-medium table,
		.btns.medium table{
			bottom: 10px;
		}
		.btn{
			width: 30px;
			height: 30px;
			border-radius: 5px;
			margin: 10px;
			color: #90a4ae;
    		background-color: #37474f;
    		box-shadow: 0 5px 8px -6px #000;
    		font-size: 25px;
		}
		.btn ion-icon{
			color: #90a4ae;
			font-size: 30px;
		}
		.btn:focus{
			outline: 0px;
		}
		.small-medium .btn{
			width: 40px;
			height: 40px;
		}
		.medium .btn{
			width: 50px;
			height: 50px;
		}
		.medium-big .btn{
			width: 55px;
			height: 55px;
		}
		.big .btn{
			width: 60px;
			height: 60px;
		}
		.large .btn{
			width: 65px;
			height: 65px;
		}
		.error{
			margin: 8px;
		}
		.dark .error{
			color: var(--dark-p);
		}
	`]
})
export class PinpadComponent implements OnInit {

	constructor(private fhem: FhemService, public settings: SettingsService) {}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_setOn: string;
	@Input() data_setOff: string;
	@Input() data_labelOnText: string;
	@Input() data_labelOffText: string;
	@Input() data_tries: string;
	@Input() data_pin: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

	public pin: Array<any> = [];
	public enteredPin = '';
	public btnSize = 'small';
	public falseCounter = 0;
	public falseText: string;

	static getSettings() {
		return {
			name: 'Pinpad',
			component: 'PinpadComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_pin', default: 'pin'},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_setOn', default: 'on'},
				{variable: 'data_setOff', default: 'off'},
				{variable: 'data_labelOnText', default: 'Alarm ist aktiv'},
				{variable: 'data_labelOffText', default: 'Alarm ist inaktiv'},
				{variable: 'data_tries', default: '5'}
			],
			dimensions: {minX: 200, minY: 270}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				if (this.fhemDevice.readings[this.data_pin]) {
					for (let i = 0; i < this.fhemDevice.readings[this.data_pin].Value.toString().length; i++) {
						this.pin.push(this.fhemDevice.readings[this.data_pin].Value[i]);
					}
				}
				this.resize({width: (this.width ? parseInt(this.width) : 200), height: (this.height ? parseInt(this.height) : 270)});
			}
		});
	}

	public resize(e) {
		if (this.fhemDevice) {
			if (e.height > 300 && e.height < 360) {
				this.btnSize = 'small-medium';
			} else if (e.height >= 360 && e.height < 380) {
				this.btnSize = 'medium';
			} else if (e.height >= 380 && e.height < 440) {
				this.btnSize = 'medium-big';
			} else if (e.height >= 440 && e.height < 460 && e.width >= 240) {
				this.btnSize = 'big';
			} else if (e.height >= 460 && e.width >= 300) {
				this.btnSize = 'large';
			} else {
				this.btnSize = 'small';
			}
		}
	}

	public enterNum(num) {
		if (this.falseCounter.toString() !== this.data_tries) {
			if (this.enteredPin.length < this.pin.length) {
				this.enteredPin += num;
			}
			if ( this.enteredPin.length === this.pin.length ) {
				if (this.enteredPin === this.fhemDevice.readings[this.data_pin].Value.toString()) {
					this.setOff();
					this.clearPin();
					this.falseCounter = 0;
				} else {
					this.clearPin();
					this.falseCounter += 1;
					if (this.falseCounter.toString() === this.data_tries) {
						let counter = 30;
						this.falseText = 'Pinpad blockiert für: ' + counter + 's';
						const interval = setInterval(() => {
							if (counter > 0) {
								counter -= 1;
								this.falseText = 'Pinpad blockiert für: ' + counter + 's';
							} else {
								clearInterval(interval);
								this.falseCounter -= 1;
							}
						}, 1000);
					}
				}
			}
		}
	}

	private clearPin() {
		setTimeout(() => {
			this.enteredPin = '';
		}, 200);
	}

	public removeNum() {
		if (parseInt(this.enteredPin) > 0) {
			this.enteredPin = this.enteredPin.substring(0, this.enteredPin.length - 1);
		}
	}

	public setOn() {
		this.set(this.data_setOn);
	}

	private setOff() {
		this.set(this.data_setOff);
	}

	private set(state) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, state);
		} else {
			this.fhem.set(this.fhemDevice.device, state);
		}
	}
}
