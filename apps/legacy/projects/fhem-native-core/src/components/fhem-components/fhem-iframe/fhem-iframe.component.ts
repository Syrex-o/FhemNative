import { Component, NgModule, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Components
import { FhemComponentModule } from '../fhem-component.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-iframe',
	templateUrl: './fhem-iframe.component.html',
	styleUrls: ['./fhem-iframe.component.scss']
})
export class FhemIframeComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_url!: string;
	@Input() bool_data_showBorder!: boolean;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	src!: SafeResourceUrl;

	ngOnInit(){
		if(this.data_device !== ''){
			this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
				this.getState(device);
			}).then((device: FhemDevice|null)=>{
				this.getState(device);
			});
		}else{
			this.src = (this.data_url !== '') ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data_url) : '';
		}
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(device && this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.fhemDevice.readings[this.data_reading].Value);
		}else{
			this.src = (this.data_url !== '') ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data_url) : '';
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		private sanitizer: DomSanitizer,
		public settings: SettingsService) {
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'IFrame',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_url', default: ''},
				{variable: 'bool_data_showBorder', default: true}
			],
			dimensions: {minX: 100, minY: 100}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule],
	declarations: [FhemIframeComponent]
})
class FhemIframeComponentModule {}