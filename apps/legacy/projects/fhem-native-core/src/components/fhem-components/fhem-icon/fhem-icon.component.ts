import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { IconModule } from '../../icon/icon.component';
import { FhemComponentModule } from '../fhem-component.module';
// Services
import { FhemService } from '../../../services/fhem.service';
// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-icon',
	templateUrl: './fhem-icon.component.html',
  	styleUrls: ['./fhem-icon.component.scss']
})
export class FhemIconComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_indicatorReading!: string;
	@Input() data_getOn!: string;
	@Input() data_getOff!: string;

	@Input() data_min!: string;
	@Input() data_max!: string;

	@Input() arr_data_indicatorPosition!: string[];
	@Input() bool_data_showIndicator!: boolean;

	// Icon
	@Input() icon_iconOn!: string;
	@Input() icon_iconOff!: string;

	// Styling
	@Input() style_iconColorOn!: string;
	@Input() style_iconColorOff!: string;
	@Input() style_indicatorColor!: string;
	@Input() style_indicatorBackgroundColor!: string;

	@Input() style_minColor!: string;
	@Input() style_maxColor!: string;	

	// advanced options
	@Input() bool_data_advancedOptions!: boolean;
	@Input() bool_data_blinkIcon!: boolean;
	@Input() data_showIndicatorOnNot!: string;

	@Input() bool_data_blinkIndicator!: boolean;
	@Input() data_blinkOnGreater!: string;
	@Input() data_blinkOnLower!: string;
	@Input() data_blinkTime!: string;

	@Input() bool_data_rotateIcon!: boolean;
	@Input() data_rotateOn!: string;
	@Input() data_rotateDeg!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	// state of fhem device
	iconState: boolean = false;
	// indicator value
	indicatorValue: any;

	// additional informers
	hideIndicator: boolean = false;
	iconBlinker: boolean = false;
	shouldRotate: boolean = false;

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
		});
	}

	private getState(device: FhemDevice|null){
		this.fhemDevice = device;
		if(device){
			this.iconState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
		}
		// check for indicator
		if(this.bool_data_showIndicator && this.fhemDevice && this.fhemDevice.readings[this.data_indicatorReading]){
			this.indicatorValue = this.fhemDevice.readings[this.data_indicatorReading].Value;
		}

		if(this.bool_data_advancedOptions){
			// check for indicator hide
			this.hideIndicator = this.checkHideIndicator();
			// check for blinking icon
			this.iconBlinker = this.checkIconBlinker();
			// check for icon rotation
			this.shouldRotate = this.checkIconRotation();
		}
	}

	private checkHideIndicator(): boolean{
		if(this.bool_data_showIndicator && this.fhemDevice && this.fhemDevice.readings[this.data_indicatorReading]){
			const currentVal: any = this.fhemDevice.readings[this.data_indicatorReading].Value;
			const refVal: any = this.data_showIndicatorOnNot;
			// if values are equal --> indicator should be hidden
			return currentVal.toString() === refVal.toString();
		}
		return false;
	}

	private checkIconBlinker(): boolean{
		if(this.bool_data_blinkIcon && this.bool_data_showIndicator && this.fhemDevice && this.fhemDevice.readings[this.data_indicatorReading]){
			if(this.data_blinkOnGreater !== '' || this.data_blinkOnLower !== ''){
				if(this.fhemDevice.readings[this.data_indicatorReading].Value > parseFloat(this.data_blinkOnGreater)){
					return true;
				}
				if(this.fhemDevice.readings[this.data_indicatorReading].Value < parseFloat(this.data_blinkOnLower)){
					return true;
				}
			}
			return false;
		}
		return false;
	}

	private checkIconRotation(): boolean{
		if(this.bool_data_rotateIcon && this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			return this.fhem.deviceReadingActive(this.fhemDevice, this.data_reading, this.data_rotateOn);
		}
		return false;
	}

	getValueColor(){
		if(this.fhemDevice && this.data_reading !== ''){
			// int colors
			if(!isNaN(this.fhemDevice.readings[this.data_reading].Value)){
				if(this.data_min !== '' && this.fhemDevice.readings[this.data_reading].Value < parseFloat(this.data_min)){
					return this.style_minColor;
				}
				if(this.data_max !== '' && this.fhemDevice.readings[this.data_reading].Value > parseFloat(this.data_max)){
					return this.style_maxColor;
				}
			}else{
				if(this.data_min !== '' && this.fhemDevice.readings[this.data_reading].Value === this.data_min){
					return this.style_minColor;
				}
				if(this.data_max !== '' && this.fhemDevice.readings[this.data_reading].Value === this.data_max){
					return this.style_maxColor;
				}
			}
		}
		// return default state
		return this.iconState ? this.style_iconColorOn : this.style_iconColorOff;
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(private fhem: FhemService){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Icon',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_indicatorReading', default: ''},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_min', default: ''},
				{variable: 'data_max', default: ''},
				{variable: 'arr_data_indicatorPosition', default: 'top-right,top-left,bottom-right,bottom-left'},
				{variable: 'bool_data_showIndicator', default: false},
				{variable: 'bool_data_advancedOptions', default: false},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_indicatorColor', default: '#86d993'},
				{variable: 'style_indicatorBackgroundColor', default: '#58677c'},
				{variable: 'style_minColor', default: '#02adea'},
				{variable: 'style_maxColor', default: '#fb0a2a'},
				// Advanced options
				// hide indicator
				{variable: 'data_showIndicatorOnNot', default: '0'},
				// blink
				{variable: 'bool_data_blinkIcon', default: false},
				{variable: 'bool_data_blinkIndicator', default: false},
				{variable: 'data_blinkOnGreater', default: '3'},
				{variable: 'data_blinkOnLower', default: '1'},
				{variable: 'data_blinkTime', default: '2'},
				// rotation
				{variable: 'bool_data_rotateIcon', default: false},
				{variable: 'data_rotateOn', default: 'on'},
				{variable: 'data_rotateDeg', default: '45'}
			],
			dependencies: {
				data_indicatorReading: { dependOn: 'bool_data_showIndicator', value: true },
				style_indicatorColor: { dependOn: 'bool_data_showIndicator', value: true },
				arr_data_indicatorPosition: { dependOn: 'bool_data_showIndicator', value: true },
				// advanced
				data_showIndicatorOnNot: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator'], value: [true, true] },
				// blink icon
				bool_data_blinkIcon: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator'], value: [true, true] },
				data_blinkOnGreater: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator', 'bool_data_blinkIcon'], value: [true, true, true] },
				data_blinkOnLower: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator', 'bool_data_blinkIcon'], value: [true, true, true] },
				data_blinkTime: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator', 'bool_data_blinkIcon'], value: [true, true, true] },
				bool_data_blinkIndicator: { dependOn: ['bool_data_advancedOptions', 'bool_data_showIndicator', 'bool_data_blinkIcon'], value: [true, true, true] },
				// rotation
				bool_data_rotateIcon: { dependOn: 'bool_data_advancedOptions', value: true },
				data_rotateOn: { dependOn: ['bool_data_advancedOptions', 'bool_data_rotateIcon'], value: [true, true] },
				data_rotateDeg: { dependOn: ['bool_data_advancedOptions', 'bool_data_rotateIcon'], value: [true, true] }
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [IconModule, FhemComponentModule],
  	declarations: [FhemIconComponent]
})
class FhemIconComponentModule {}