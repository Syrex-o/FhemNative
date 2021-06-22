import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { IonicModule } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';
import { PickerComponentModule } from '../../picker/picker.component';

// Services
import { FhemService } from '../../../services/fhem.service'
import { TimeService } from '../../../services/time.service';
import { SettingsService } from '../../../services/settings.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-medialist',
	templateUrl: './fhem-medialist.component.html',
  	styleUrls: ['./fhem-medialist.component.scss']
})
export class FhemMedialistComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_setReading!: string;
	@Input() arr_data_setList!: string[];

	// Different player options
	// Player Device Name
	@Input() data_playerDevice!: string;
	// Player Type (indicates start of 0 or 1) (Sonos = 1, MPD = 0)
	@Input() arr_data_player!: string[];

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	fhemDevice!: FhemDevice|null;
	list: Array<any> = [];
	displayDetails: any = {show: false, index: 0};

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
		});
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			this.list = this.fhemDevice.readings[this.data_reading].Value;
		}
	}

	// toggle full playlist
	toggleAll(): void{
		if(this.fhemDevice){
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, this.arr_data_setList[0]);
			this.native.nativeClickTrigger();
		}
	}

	// play specific item
	playItem(index: number): void{
		if(this.data_playerDevice !== ''){
			this.fhem.setAttr(this.data_playerDevice, 'play', (this.arr_data_player[0] === 'Sonos' ? index + 1 : index));
		}
		this.native.nativeClickTrigger();
	}

	// show song info
	showDetails(index: number): void{
		this.displayDetails.show = !this.displayDetails.show;
		this.displayDetails.index = index;
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		public time: TimeService,
		private fhem: FhemService,
		private native: NativeFunctionsService,
		public settings: SettingsService) {
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'MediaList',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'currentdir_playlist'},
				{variable: 'data_setReading', default: 'Play'},
				{variable: 'data_playerDevice', default: ''},
				{variable: 'arr_data_setList', default: 'currentdir,playlist'},
				{variable: 'arr_data_player', default: 'Sonos,MPD'}
			],
			dimensions: {minX: 200, minY: 80}
		};
	}
}
@NgModule({
	imports: [IonicModule, FhemComponentModule, PickerComponentModule],
  	declarations: [FhemMedialistComponent]
})
class FhemMedialistComponentModule {}