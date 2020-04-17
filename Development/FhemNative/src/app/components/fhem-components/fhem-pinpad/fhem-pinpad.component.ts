import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
import { IonicModule } from '@ionic/angular';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-pinpad',
	templateUrl: './fhem-pinpad.component.html',
  	styleUrls: ['./fhem-pinpad.component.scss']
})
export default class FhemPinpadComponent implements OnInit, OnDestroy {
	@Input() ID: string;

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
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	pin: Array<any>;
	enteredPin = '';
	falseCounter: number = 0;
	falseText: string;


	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then((device)=>{
			this.getState(device);
		});
	}

	private getState(device){
		this.pin = [];
		this.fhemDevice = device;
		if(device){
			if (this.fhemDevice.readings[this.data_pin]) {
				for (let i = 0; i < this.fhemDevice.readings[this.data_pin].Value.toString().length; i++) {
					this.pin.push(this.fhemDevice.readings[this.data_pin].Value[i]);
				}
			}
		}
	}

	enterNum(num) {
		if (this.falseCounter.toString() !== this.data_tries) {
			if (this.enteredPin.length < this.pin.length) {
				this.enteredPin += num.toString();
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
		this.native.nativeClickTrigger();
	}

	removeNum(){
		if (parseInt(this.enteredPin) > 0) {
			this.enteredPin = this.enteredPin.substring(0, this.enteredPin.length - 1);
		}
		this.native.nativeClickTrigger();
	}

	private clearPin() {
		setTimeout(() => {
			this.enteredPin = '';
		}, 200);
		this.native.nativeClickTrigger();
	}

	setOn(){
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
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		private native: NativeFunctionsService,
		public settings: SettingsService){
	}

	static getSettings() {
		return {
			name: 'Pinpad',
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
}
@NgModule({
	imports: [ComponentsModule, IonicModule],
  	declarations: [FhemPinpadComponent]
})
class FhemPinpadComponentModule {}