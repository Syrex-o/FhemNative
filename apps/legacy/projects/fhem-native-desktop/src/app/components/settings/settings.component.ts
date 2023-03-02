import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Services
import { ToastService } from '@FhemNative/services/toast.service';
import { StorageService } from '@FhemNative/services/storage.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { SettingsChildService } from '../../services/settings.service';

// Components
import { IonicModule } from '@ionic/angular';
import { SwitchComponentModule } from '@FhemNative/components/switch/switch.component';
import { SelectComponentModule } from '@FhemNative/components/select/select.component';
import { CoreSettingsComponentModule } from '@FhemNative/components/settings/core-settings.component';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
	// device sizes for rescale
	devices: Array<{device: string, dimensions: {width: number, height: number}}> = [];

	constructor(
		private http: HttpClient,
		private toast: ToastService,
		private storage: StorageService,
		public settings: SettingsService, 
		private translate: TranslateService,
		private settingsChild: SettingsChildService){}

	ngOnInit(){
		// get device sizes
		const getDevices: Subscription = this.http.get('https://raw.githubusercontent.com/Syrex-o/FhemNative/master/DEVICE_SIZE_LIST.json').subscribe((res:any)=>{
			getDevices.unsubscribe();
			if(res && res.DEVICES){
				this.devices = res.DEVICES;
			}
		});
	}

	// open FhemNative Website
	openWebsite(): void{
		window.open('https://fhemnative.de/');
	}

	// open data privacy terms
	openPrivacy(): void{
		window.open('https://fhemnative.de/privacy-app');
	}

	// change app setting
	changeAppSettingJSON(setting: string, jsonProp: string, value: any): void{
		this.settings.app[setting][jsonProp] = value;
		this.storage.changeSetting({ name: setting, change: JSON.stringify(this.settings.app[setting]) }).then((res) => {
			this.settings.app[setting] = res;
		});
	}

	// change window size
	changeCustomDeviceSize(selectedDevice: string): void{
		const found = this.devices.find(x=> x.device === selectedDevice);
		if(found){
			this.settings.app.customWindowScale.deviceSelection = selectedDevice;
			this.settings.app.customWindowScale.dimensions = found.dimensions;
			this.settingsChild.scaleWindow();
			// save settings
			this.storage.changeSetting({ name: 'customWindowScale', change: JSON.stringify(this.settings.app.customWindowScale) });
		}
	}

	changeCustomDeviceSizeFromInput(): void{
		let dim = this.settings.app.customWindowScale.dimensions;
		if(dim.width >= 200 && dim.height >= 200){
			this.settings.app.customWindowScale.deviceSelection = '';
			this.settings.app.customWindowScale.dimensions = dim;
			this.settingsChild.scaleWindow();
			// save settings
			this.storage.changeSetting({ name: 'customWindowScale', change: JSON.stringify(this.settings.app.customWindowScale) });
		}else{
			// error
			this.toast.showAlert(
				this.translate.instant('GENERAL.SETTINGS.ADVANCED.WINDOW.CUSTOM.ERROR.TITLE'),
				this.translate.instant('GENERAL.SETTINGS.ADVANCED.WINDOW.CUSTOM.ERROR.INFO'),
				false
			);
		}

	}
}
@NgModule({
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule,
		SwitchComponentModule,
		SelectComponentModule,
		CoreSettingsComponentModule
	],
	declarations: [SettingsComponent]
})
class SettingsComponentModule {}