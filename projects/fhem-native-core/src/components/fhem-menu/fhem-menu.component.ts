import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, Output, EventEmitter, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// Components
import { TrimModule } from '../../directives/trim.directive';
import { SwitchComponentModule } from '../switch/switch.component';
import { PopoverComponentModule } from '../popover/popover.component';

// Translate
import { TranslateModule } from '@ngx-translate/core';

// Services
import { FhemService } from '../../services/fhem.service';
import { StorageService } from '../../services/storage.service';
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';

// Interfaces
import { Room } from '../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-menu',
	templateUrl: './fhem-menu.component.html',
  	styleUrls: ['./fhem-menu.component.scss'],
  	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FhemMenuComponent implements OnChanges {
	@Input() mode!: string;
	popupState: boolean = false;

	// indicate that values were already removed --> no reconnect trigger
	private valuesResetted: boolean = false;

	// outputs
	@Output() onClose: EventEmitter<boolean> = new EventEmitter();

	constructor(
		private fhem: FhemService,
		private storage: StorageService,
		public settings: SettingsService,
		private structure: StructureService){}

	ngOnChanges(changes: SimpleChanges){
		if(changes.mode && changes.mode.currentValue !== ''){
			this.popupState = true;
			// disable fhem connection
			if(changes.mode.currentValue === 'ip-config'){
				this.fhem.noReconnect = true;
				if(this.fhem.connected){
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
			IP: '', PORT: '8080',
			WSS: false,
			type: "Fhemweb",
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
		// modify password and username to uri
		this.settings.connectionProfiles.forEach((profile)=>{
			if(profile.basicAuth){
				profile.USER = encodeURIComponent(profile.USER);
				profile.PASSW = encodeURIComponent(profile.PASSW);
			}
		});

		// save settings
		this.storage.changeSetting({
			name: 'connectionProfiles',
			change: JSON.stringify(this.settings.connectionProfiles)
		}).then((res)=>{
			this.resetModes();
		});
	}

	// navigate and reload room
	private navigator(): void{
		const room: Room = this.structure.currentRoom;
		this.structure.navigateToRoom(room.name, room.ID, { 
			name: room.name, 
			ID: room.ID, 
			UID: room.UID, 
			reload: true,
			reloadID: this.settings.getUID()
		});
	}

	// cancel settings
	cancelIPSettings(): void{
		this.storage.getSetting('connectionProfiles').then((res: any)=>{
			this.settings.connectionProfiles = res;
			this.resetModes();
		});
	}

	// close from settings changes
	private resetModes(): void{
		this.valuesResetted = true;

		this.onClose.emit(true);
		// reset vals
		this.settings.modes.fhemMenuMode = '';
		this.fhem.connectionInProgress = false;
		this.fhem.noReconnect = false;
		this.fhem.tries = 0;

		// check profile
		const initialProfile = this.settings.connectionProfiles[0];
		if(initialProfile && initialProfile.IP !== ''){
			// connect fhem
			this.fhem.connectFhem();
		}
		this.navigator();

		setTimeout(()=>{
			this.valuesResetted = false;
		}, 0);
	}

	// close from template
	closeFromTemplate(): void{
		if(!this.valuesResetted) this.resetModes();
	}
}

@NgModule({
	declarations: [ FhemMenuComponent ],
	imports: [ 
		FormsModule,
		IonicModule, 
		CommonModule, 
		TrimModule,
		TranslateModule,
		SwitchComponentModule, 
		PopoverComponentModule 
	],
	exports: [ FhemMenuComponent ]
})
export class FhemMenuModule {}