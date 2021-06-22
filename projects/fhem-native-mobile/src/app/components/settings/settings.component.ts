import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Services
import { StorageService } from '@FhemNative/services/storage.service';
import { SettingsService } from '@FhemNative/services/settings.service';

// Components
import { SwitchComponentModule } from '@FhemNative/components/switch/switch.component';
import { PopoverComponentModule } from '@FhemNative/components/popover/popover.component';
import { CoreSettingsComponentModule } from '@FhemNative/components/settings/core-settings.component';

// Plugins
import { StatusBar } from '@capacitor/status-bar';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
	// get device size
	deviceSize: {width: number, height: number} = {width: 0, height: 0};

	constructor(public settings: SettingsService, private translate: TranslateService, private storage: StorageService){}

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
}
@NgModule({
	imports: [
		FormsModule,
		TranslateModule,
		SwitchComponentModule,
		CoreSettingsComponentModule
	],
	declarations: [SettingsComponent]
})
class SettingsComponentModule {}