import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
	selector: 'fhem-image',
	templateUrl: './fhem-image.component.html',
  	styleUrls: ['./fhem-image.component.scss']
})
export class FhemImageComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_url: string;
	@Input() data_updateInterval: string;
	@Input() bool_data_cache: boolean;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	src: string;

	private interval: any;

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
			this.src = this.fhemDevice.readings[this.data_reading].Value;
		}else{
			this.src = this.data_url !== '' ? this.data_url : '';
		}
		this.updateImageData(this.src);
	}

	private updateImageData(src: string){
		if(src !== ''){
			// build interval
			if(!this.bool_data_cache){
				if(this.interval){
					clearInterval(this.interval);
				}
				this.interval = setInterval(()=>{
					this.src = src +'?dummy=' + new Date().getTime();
					console.log(this.src);
				}, parseInt(this.data_updateInterval) * 1000);
			}
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);

		if(this.interval){
			clearInterval(this.interval);
		}
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService) {}

	static getSettings() {
		return {
			name: 'Image',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_url', default: ''},
				{variable: 'data_updateInterval', default: '10'},
				{variable: 'bool_data_cache', default: true}
			],
			dependencies:{
				data_updateInterval: {dependOn: 'bool_data_cache', value: false}
			},
			dimensions: {minX: 40, minY: 40}
		};
	}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
  	declarations: [FhemImageComponent]
})
class FhemImageComponentModule {}