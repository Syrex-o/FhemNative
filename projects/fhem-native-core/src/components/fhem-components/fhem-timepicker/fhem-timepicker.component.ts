import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { FhemComponentModule } from '../fhem-component.module';
import { TimepickerComponentModule } from '../../timepicker/timepicker.component';

// Services
import { FhemService } from '../../../services/fhem.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-timepicker',
	templateUrl: './fhem-timepicker.component.html',
  	styleUrls: ['./fhem-timepicker.component.scss']
})
export class FhemTimepickerComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
    @Input() data_reading!: string;
    @Input() data_setReading!: string;
    @Input() data_maxHours!: string;
    @Input() data_maxMinutes!: string;
    @Input() data_confirmBtn!: string;
    @Input() data_cancelBtn!: string;
    @Input() data_label!: string;

    @Input() bool_data_showBorder!: boolean;
    @Input() arr_data_format!: string[];

    // position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	value: string = '';

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			// init
			this.data_label = this.data_label !== '' ? this.data_label : this.data_device;
			this.getState(device);
		});
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			this.value = this.fhemDevice.readings[this.data_reading].Value;
		}
	}

	updateTime(time: string): void{
		if(this.fhemDevice){
			if (this.data_setReading !== '') {
				this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, time);
			} else {
				this.fhem.set(this.fhemDevice.device, time);
			}
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(private fhem: FhemService, private native: NativeFunctionsService) {}

	static getSettings(): ComponentSettings {
		return {
			name: 'Time Picker',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_label', default: ''},
				{variable: 'data_confirmBtn', default: 'Bestätigen'},
				{variable: 'data_cancelBtn', default: 'Abbrechen'},
				{variable: 'data_maxHours', default: '24'},
				{variable: 'data_maxMinutes', default: '60'},
				{variable: 'arr_data_format', default: 'HH:mm,HH,mm'},
				{variable: 'bool_data_showBorder', default: true}
			],
			dimensions: {minX: 100, minY: 40}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule, TimepickerComponentModule],
  	declarations: [FhemTimepickerComponent]
})
class FhemTimepickerComponentModule {}