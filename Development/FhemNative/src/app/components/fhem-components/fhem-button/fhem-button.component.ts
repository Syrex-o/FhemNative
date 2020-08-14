import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-button',
	templateUrl: './fhem-button.component.html',
  	styleUrls: ['./fhem-button.component.scss']
})
export class FhemButtonComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_setOn: string;
	@Input() data_setOff: string;
	@Input() data_sendCommand: string;
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

	fhemDevice: FhemDevice|null;
	// state of fhem device
	buttonState: boolean;

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
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		this.buttonState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
	}

	sendCmd(): void{
		if (this.data_sendCommand === '') {
			if(this.fhemDevice){
				const command: string = this.fhem.deviceReadingActive(this.fhemDevice, this.data_reading, this.data_getOn) ? this.data_setOff : this.data_setOn;
				if (this.data_setReading !== '') {
						this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
				} else {
					this.fhem.set(this.fhemDevice.device, command);
				}
			}
		}else{
			this.fhem.sendCommand({command: this.data_sendCommand});
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}
	
	constructor(private fhem: FhemService, public settings: SettingsService, private native: NativeFunctionsService){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Button',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_setOn', default: 'on'},
				{variable: 'data_setOff', default: 'off'},
				{variable: 'data_label', default: ''},
				{variable: 'data_sendCommand', default: ''},
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
	imports: [ComponentsModule],
  	declarations: [FhemButtonComponent]
})
class FhemButtonComponentModule {}