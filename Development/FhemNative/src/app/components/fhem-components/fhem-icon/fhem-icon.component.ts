import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';

@Component({
	selector: 'fhem-icon',
	templateUrl: './fhem-icon.component.html',
  	styleUrls: ['./fhem-icon.component.scss']
})
export class FhemIconComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_indicatorReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;

	@Input() data_min: string;
	@Input() data_max: string;

	@Input() arr_data_indicatorPosition: string[];

	@Input() bool_data_showIndocator: boolean;

	// Icon
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;
	@Input() style_indicatorColor: string;
	@Input() style_indicatorBackgroundColor: string;

	@Input() style_minColor: string;
	@Input() style_maxColor: string;	

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	// state of fhem device
	iconState: boolean;

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then(device=>{
			this.getState(device);
		});
	}

	private getState(device){
		this.fhemDevice = device;
		if(device){
			this.iconState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
		}
	}

	getValueColor(){
		if(this.data_reading !== ''){
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

	constructor(private fhem: FhemService) {}

	static getSettings() {
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
				{variable: 'bool_data_showIndocator', default: false},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_indicatorColor', default: '#86d993'},
				{variable: 'style_indicatorBackgroundColor', default: '#58677c'},
				{variable: 'style_minColor', default: '#02adea'},
				{variable: 'style_maxColor', default: '#fb0a2a'}
			],
			dependencies: {
				data_indicatorReading: { dependOn: 'bool_data_showIndocator', value: true },
				style_indicatorColor: { dependOn: 'bool_data_showIndocator', value: true },
				arr_data_indicatorPosition: { dependOn: 'bool_data_showIndocator', value: true }
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemIconComponent]
})
class FhemIconComponentModule {}