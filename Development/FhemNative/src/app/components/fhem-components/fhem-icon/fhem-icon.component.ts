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
export default class FhemIconComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_indicatorReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() bool_data_showIndocator: boolean;

	// Icon
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;
	@Input() style_indicatorColor: string;
	@Input() style_indicatorBackgroundColor: string;

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
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_indicatorColor', default: '#86d993'},
				{variable: 'style_indicatorBackgroundColor', default: '#58677c'},
				{variable: 'bool_data_showIndocator', default: false},
			],
			dependencies: {
				data_indicatorReading: { dependOn: 'bool_data_showIndocator', value: true },
				style_indicatorColor: { dependOn: 'bool_data_showIndocator', value: true }
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