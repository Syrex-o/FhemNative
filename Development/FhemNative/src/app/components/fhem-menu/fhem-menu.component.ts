import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StorageService } from '../../services/storage.service';
import { FhemService } from '../../services/fhem.service';

@Component({
	selector: 'fhem-menu',
	templateUrl: './fhem-menu.component.html',
  	styleUrls: ['./fhem-menu.component.scss'],
  	changeDetection: ChangeDetectionStrategy.OnPush
})

export class FhemMenuComponent implements OnChanges {
	popupState: boolean = false;

	@Input() mode: string;

	constructor(
		public settings: SettingsService,
		private storage: StorageService,
		private fhem: FhemService){}

	ngOnChanges(changes: SimpleChanges){
		if(changes.mode && changes.mode.currentValue !== ''){
			this.popupState = true;
			if(changes.mode.currentValue === 'ip-config'){
				if(this.fhem.connected){
					this.fhem.noReconnect = true;
					this.fhem.disconnect();
				}
			}
		}else{
			this.popupState = false;
		}
	}

	// Add connection profile
	addProfile(){
		this.settings.connectionProfiles.push({
			IP: '',
			PORT: '8080',
			WSS: false,
			type: "Websocket",
			basicAuth: false,
			USER: '',
			PASSW: ''
		});
	}

	// delete profile
	deleteProfile(index: number){
		this.settings.connectionProfiles.splice(index, 1);
	}

	// save settings
	saveIPSettings(){
		this.storage.changeSetting({
			name: 'connectionProfiles',
			change: JSON.stringify(this.settings.connectionProfiles)
		}).then((res)=>{
			this.resetModes();
		})
	}

	// cancel settings
	cancelIPSettings(){
		this.storage.getSetting('connectionProfiles').then((res: any)=>{
			this.settings.connectionProfiles = res;
			this.resetModes();
		});
	}

	// reset menu modes
	resetModes(){
		this.settings.modes.fhemMenuMode = '';
		this.fhem.noReconnect = false;
		this.fhem.connectFhem();
	}
}