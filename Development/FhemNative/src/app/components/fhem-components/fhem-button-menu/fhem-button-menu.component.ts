import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
import { TranslateModule } from '@ngx-translate/core';

// Interfaces
import { ComponentSettings, FhemDevice, Room, RoomParams } from '../../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../../services/fhem.service';
import { ToastService } from '../../../services/toast.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';
// Translator
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'fhem-button-menu',
	templateUrl: './fhem-button-menu.component.html',
  	styleUrls: ['../fhem-button/fhem-button.component.scss']
})
export class FhemButtonMenuComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_room: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_label: string;
	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;
	@Input() data_iconSize: string;
	@Input() arr_data_style: string[];

	// Icon
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;
	@Input() style_buttonColor: string;
	@Input() style_labelColor: string;

	@Input() bool_data_iconOnly: boolean;
	@Input() bool_data_customBorder: boolean;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;
	@Input() rotation: string;

	fhemDevice: FhemDevice|null;
	// state of fhem device
	buttonState: boolean;
	// room present evaluation
	roomPresent: boolean = false;

	ngOnInit() {
		if(this.data_device){
			this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
				this.getState(device);
			}).then((device: FhemDevice|null)=>{
				this.getState(device);
				// attatch label
				if(device){
					this.data_label = (this.data_label && this.data_label !== '') ? this.data_label : this.fhemDevice.device;
				}
			});
		}
		// check room availability on init
		if(this.structure.rooms.find(x=> x.name === this.data_room)){
			this.roomPresent = true;
		}
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		this.buttonState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
	}

	switchRoom(): void{
		const neededRoom: Room|null = this.structure.rooms.find(x=> x.name === this.data_room);
		if(neededRoom){
			// multiple results will result in first found
			// router params
			const params: RoomParams = {
				name: neededRoom.name,
				ID: neededRoom.ID,
				UID: neededRoom.UID,
				reload: false
			}
			// switch room
			this.structure.navigateToRoom(neededRoom.name, neededRoom.ID, params);
		}else{
			// room not found
			this.toast.addNotify(
				this.translate.instant('COMPONENTS.Button Menu.TRANSLATOR.ROOM_NOT_FOUND.HEADER'),
				this.translate.instant('COMPONENTS.Button Menu.TRANSLATOR.ROOM_NOT_FOUND.MESSAGE'),
				false,
				1000
			);
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}
	
	constructor(
		private fhem: FhemService, 
		public settings: SettingsService, 
		private native: NativeFunctionsService, 
		private toast: ToastService, 
		private structure: StructureService,
		private translate: TranslateService
	){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Button Menu',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_room', default: ''},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_label', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'data_iconSize', default: '20'},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'bool_data_iconOnly', default: false},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_buttonColor', default: '#86d993'},
				{variable: 'style_labelColor', default: '#fff'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'}
			],
			dependencies: {
				data_iconSize: { dependOn: 'bool_data_iconOnly', value: false },
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },
				// neumorph dependencies
				style_buttonColor: { dependOn: 'arr_data_style', value: 'standard' }
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
  	declarations: [FhemButtonMenuComponent]
})
class FhemButtonMenuComponentModule {}