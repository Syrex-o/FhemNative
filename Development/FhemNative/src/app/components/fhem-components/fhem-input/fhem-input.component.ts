import { Component, Input, NgModule, OnInit } from '@angular/core';

// Components
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';
import { StorageService } from '../../../services/storage.service';
import { SettingsService } from '../../../services/settings.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-input',
	templateUrl: './fhem-input.component.html',
  	styleUrls: ['./fhem-input.component.scss']
})
export class FhemInputComponent implements OnInit {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_setReading: string;

	@Input() bool_data_showShadow: boolean;
	@Input() bool_data_showFavorites: boolean;

	@Input() icon_sendIcon: string;

	@Input() style_backgroundColor: string;
	@Input() style_textColor: string;
	@Input() style_iconColor: string;
	@Input() style_borderColor: string;
	@Input() style_buttonColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	// command
	command: string = '';
	animateSend: boolean = false;

	showFavs: boolean = false;
	commandFavs: string[];

	ngOnInit(){
		this.storage.setAndGetSetting({name: 'commandFavs', default: JSON.stringify([])}).then((val: any) => {
			this.commandFavs = val;
		});
	}

	sendCmd(){
		this.animateSend = true;
		setTimeout(()=>{
			this.animateSend = false;
			this.command = '';
		}, 500);
		// send command
		if(this.command !== ''){
			if (this.data_device !== '' && this.data_setReading !== '') {
				this.fhem.setAttr(this.data_device, this.data_setReading, this.command);
				// add to favs
				this.saveFavCommand(this.data_device + ' ' + this.data_setReading + ' '  + this.command);
			}
			else if(this.data_device !== ''){
				this.fhem.set(this.data_device, this.command);
				// add to favs
				this.saveFavCommand(this.data_device + ' ' + this.command);
			}else{
				this.fhem.sendCommand({
					command: this.command
				});
				// add to favs
				this.saveFavCommand(this.command);
			}
		}
		this.native.nativeClickTrigger();
	}

	private saveFavCommand(command: string){
		// only save favorites if they are visible
		if(!this.commandFavs.includes(command) && this.bool_data_showFavorites){
			this.commandFavs.push(command);
			this.storage.changeSetting({name: 'commandFavs', change: this.commandFavs});
		}
	}

	showCommandFavs(){
		// load favs
		this.showFavs = true;
		this.storage.setAndGetSetting({name: 'commandFavs', default: JSON.stringify([])}).then((val: any) => {
			this.commandFavs = val;
		});
	}

	setFavCommand(command: string){
		this.fhem.sendCommand({
			command: command
		});
		this.native.nativeClickTrigger();
	}

	removeFavCommand(index: number){
		this.commandFavs.splice(index, 1);
		this.storage.changeSetting({name: 'commandFavs', change: this.commandFavs});
		this.native.nativeClickTrigger();
	}

	constructor(
		private fhem: FhemService, 
		private storage: StorageService,
		public settings: SettingsService, 
		private native: NativeFunctionsService){

	}

	static getSettings() {
		return {
			name: 'Input',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'bool_data_showShadow', default: true},
				{variable: 'bool_data_showFavorites', default: false},
				{variable: 'icon_sendIcon', default: 'paper-plane'},
				{variable: 'style_backgroundColor', default: '#b0b0b0'},
				{variable: 'style_textColor', default: '#fff'},
				{variable: 'style_iconColor', default: '#fff'},
				{variable: 'style_borderColor', default: '#565656'},
				{variable: 'style_buttonColor', default: '#14a9d5'}
			],
			dimensions: {minX: 100, minY: 35}
		}
	}
}
@NgModule({
	imports: [ComponentsModule, IonicModule, TranslateModule],
  	declarations: [FhemInputComponent]
})
class FhemInputComponentModule {}