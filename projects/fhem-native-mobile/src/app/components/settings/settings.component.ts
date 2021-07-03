import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Services
import { StorageService } from '@FhemNative/services/storage.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { NativeFunctionsService } from '@FhemNative/services/native-functions.service';
import { NativeFunctionsChildService } from '../../services/native-functions.service';

// Components
import { SwitchComponentModule } from '@FhemNative/components/switch/switch.component';
import { PopoverComponentModule } from '@FhemNative/components/popover/popover.component';
import { CoreSettingsComponentModule } from '@FhemNative/components/settings/core-settings.component';

// Plugins
import { StatusBar } from '@capacitor/status-bar';

// Animations
import { ShowHide } from '@FhemNative/animations';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	animations: [ ShowHide ]
})
export class SettingsComponent implements OnInit {
	// get device size
	deviceSize: {width: number, height: number} = {width: 0, height: 0};

	constructor(
		private storage: StorageService,
		public settings: SettingsService, 
		private translate: TranslateService, 
		public native: NativeFunctionsService,
		private nativeChild: NativeFunctionsChildService){}

	ngOnInit(){
		this.deviceSize.width = window.innerWidth;
		this.deviceSize.height = window.innerHeight;
	}

	// open FhemNative Website
	openWebsite(): void{
		window.open('https://fhemnative.de/');
	}

	// open data privacy terms
	openPrivacy(): void{
		window.open('https://fhemnative.de/privacy-app');
	}

	// change status bar settings
	async changeStatusBar(event: boolean): Promise<void>{
		await this.storage.changeSetting({name: 'showStatusBar', change: event}).then((res: boolean) => {
			this.settings.app['showStatusBar'] = res;
		});
		if(event){
			// show
			await StatusBar.show();
		}else{
			// hide
			await StatusBar.hide();
		}
	}

	// change app setting
	changeAppSettingJSON(setting: string, jsonProp: string, value: any): void {
		this.settings.app[setting][jsonProp] = value;
		this.storage.changeSetting({ name: setting, change: JSON.stringify(this.settings.app[setting]) }).then((res) => {
			this.settings.app[setting] = res;
		});
	}

	changeVibrationDuration(event: any): void {
		const value: number = event.detail.value;
		// change storage
		this.changeAppSettingJSON('hapticFeedback', 'duration', value);
		// vibration demo
		this.native.vibrate(value * 1000);
	}

	changeAudioEnable(value: boolean): void{
		// change storage
		this.changeAppSettingJSON('acusticFeedback', 'enable', value);
		// load audio files
		if(value) this.nativeChild.preloadAudio();
	}

	changeAudio(event: any): void{
		const value: string = event.detail.value;
		// change storage
		this.changeAppSettingJSON('acusticFeedback', 'audio', value);
		// sound demo
		this.native.playAudio(value);
	}
}
@NgModule({
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule,
		SwitchComponentModule,
		CoreSettingsComponentModule
	],
	declarations: [SettingsComponent]
})
class SettingsComponentModule {}