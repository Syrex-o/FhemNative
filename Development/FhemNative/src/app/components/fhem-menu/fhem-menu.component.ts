import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
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
		private structure: StructureService,
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
	addProfile(): void{
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
	deleteProfile(index: number): void{
		this.settings.connectionProfiles.splice(index, 1);
	}

	// save settings
	saveIPSettings(): void{
		this.storage.changeSetting({
			name: 'connectionProfiles',
			change: JSON.stringify(this.settings.connectionProfiles)
		}).then((res)=>{
			this.resetModes();
			// reload room 
			const room = this.structure.currentRoom;
			this.structure.navigateToRoom(room.name, room.ID, { 
				name: room.name,
				ID: room.ID,
				UID: room.UID,
				reload: true
			});
		})
	}

	// cancel settings
	cancelIPSettings(): void{
		this.storage.getSetting('connectionProfiles').then((res: any)=>{
			this.settings.connectionProfiles = res;
			this.resetModes();
		});
	}

	// reset menu modes
	resetModes(): void{
		this.settings.modes.fhemMenuMode = '';
		this.fhem.noReconnect = false;
		this.fhem.connectFhem();
	}
}