import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
	selector: 'fhem-label',
	templateUrl: './fhem-label.component.html',
  	styleUrls: ['./fhem-label.component.scss']
})
export class FhemLabelComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_label: string;
	@Input() data_labelExtension: string;
	@Input() data_size: string;
	@Input() data_min: string;
	@Input() data_max: string;
	@Input() data_fontWeight: string;
	@Input() arr_data_textAlign: string[];

	// Styling
	@Input() style_color: string;
	@Input() style_minColor: string;
	@Input() style_maxColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	label: string;

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then(device=>{
			this.getState(device);
		});
	}

	private getState(device){
		this.fhemDevice = device;
		if(device && this.fhemDevice.readings[this.data_reading]){
			this.label = this.fhemDevice.readings[this.data_reading].Value;
		}else{
			this.label = this.data_label;
		}
	}

	getValueColor(){
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
		return this.style_color;
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService) {
	}

	static getSettings() {
		return {
			name: 'Label',
			type: 'style',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_label', default: ''},
				{variable: 'data_labelExtension', default: ''},
				{variable: 'data_size', default: '16'},
				{variable: 'data_min', default: ''},
				{variable: 'data_max', default: ''},
				{variable: 'data_fontWeight', default: '300'},
				{variable: 'arr_data_textAlign', default: 'left,center,right'},
				{variable: 'style_color', default: '#86d993'},
				{variable: 'style_minColor', default: '#02adea'},
				{variable: 'style_maxColor', default: '#fb0a2a'}
			],
			dimensions: {minX: 60, minY: 40}
		};
	}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
  	declarations: [FhemLabelComponent]
})
class FhemLabelComponentModule {}