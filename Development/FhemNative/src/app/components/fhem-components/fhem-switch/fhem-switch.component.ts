import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-switch',
	templateUrl: './fhem-switch.component.html',
  	styleUrls: ['./fhem-switch.component.scss']
})
export class FhemSwitchComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_setOn: string;
	@Input() data_setOff: string;
	@Input() data_label: string;
	@Input() data_subLabel: string;
	@Input() bool_data_showBorder: boolean;
	@Input() bool_data_customLabels: boolean;
	@Input() arr_data_buttonStyle: string|string[];
	// Style
	@Input() style_borderColor: string;
	@Input() style_colorOn: string;
	@Input() style_colorOff: string;
	@Input() style_thumbColorOn: string;
	@Input() style_thumbColorOff: string;
	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;
	@Input() rotation: string;

	fhemDevice: any;
	// state of fhem device
	toggleState: boolean;

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then(device=>{
			this.getState(device);
		});
	}

	private getState(device){
		this.fhemDevice = device;
		this.toggleState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
	}

	toggle(event){
		const command = this.fhem.deviceReadingActive(this.fhemDevice, this.data_reading, this.data_getOn) ? this.data_setOff : this.data_setOn;
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
		} else {
			this.fhem.set(this.fhemDevice.device, command);
		}
		this.native.nativeClickTrigger();
	}

	constructor(
		private fhem: FhemService,
		private native: NativeFunctionsService){
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	static getSettings() {
		return {
			name: 'Switch',
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
				{variable: 'data_subLabel', default: ''},
				{variable: 'bool_data_showBorder', default: true},
				{variable: 'bool_data_customLabels', default: false},
				{variable: 'arr_data_buttonStyle', default: 'toggle,toggle-outline,gooey-inline,gooey-outline,NM-IN-toggle,NM-OUT-toggle,NM-IN-toggle-outline,NM-OUT-toggle-outline,NM-IN-gooey-outline,NM-OUT-gooey-outline'},
				{variable: 'style_borderColor', default: '#565656'},
				{variable: 'style_colorOn', default: '#2994b3'},
				{variable: 'style_colorOff', default: '#a2a4ab'},
				{variable: 'style_thumbColorOn', default: '#14a9d5'},
				{variable: 'style_thumbColorOff', default: '#fff'}
			],
			dependencies: {
				style_borderColor: { dependOn: 'bool_data_showBorder', value: true },
				data_label: { dependOn: 'bool_data_customLabels', value: true },
				data_subLabel: { dependOn: 'bool_data_customLabels', value: true },
				// neumorph dependencies
				style_colorOn: { dependOn: 'arr_data_buttonStyle', value: [
					'toggle', 'toggle-outline', 'gooey-inline', 'gooey-outline',
					'NM-OUT-toggle', 'NM-OUT-toggle-outline', 'NM-OUT-gooey-outline'
				] },
				style_colorOff: { dependOn: 'arr_data_buttonStyle', value: [
					'toggle', 'toggle-outline', 'gooey-inline', 'gooey-outline',
					'NM-OUT-toggle', 'NM-OUT-toggle-outline', 'NM-OUT-gooey-outline'
				] },
			},
			dimensions: {minX: 100, minY: 45}
		}
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemSwitchComponent]
})
class FhemSwitchComponentModule {}