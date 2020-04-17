import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-button-multistate',
	templateUrl: './fhem-button-multistate.component.html',
  	styleUrls: ['./fhem-button-multistate.component.scss']
})
export default class FhemButtonMultistateComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() data_getOn: any;
	@Input() data_setOn: any;
	@Input() data_label: string;
	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;
	@Input() data_iconSize: string;

	@Input() bool_data_iconOnly: boolean;
	@Input() bool_data_customBorder: boolean;

	@Input() arr_icon_icons: string|string[];
	@Input() arr_style_iconColors: string|string[];
	@Input() arr_style_labelColors: string|string[];
	@Input() arr_style_buttonColors: string|string[];

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;

	constructor(private fhem: FhemService, private native: NativeFunctionsService){}

	ngOnInit(){
		if(this.data_device){
			this.fhem.getDevice(this.ID, this.data_device, (device)=>{
				this.getState(device);
			}).then(device=>{
				this.getState(device);
				// attatch label
				if(device){
					this.initStates();
				}
			});
		}
	}

	private getState(device){
		this.fhemDevice = device;
	}

	private initStates(){
		this.data_getOn = this.data_getOn !== '' ? this.data_getOn.replace(/\s/g, '').split(',') : [''];
		this.data_setOn = this.data_setOn !== '' ? this.data_setOn.replace(/\s/g, '').split(',') : [''];
		this.data_label = (this.data_label && this.data_label !== '') ? this.data_label : this.fhemDevice.device;
	}

	// get the dedicated values from arrays
	getArrValue(arr, def){
		// fallback if needed, to reduce errors
		let res = def ? def : (this[arr][0] ? this[arr][0] : '#ddd');
		if(this.fhemDevice){
			const value = this.fhemDevice.readings[this.data_reading].Value.toString().toLowerCase();
			const getList = this.data_getOn.map(x=> x.toString().toLowerCase());
			if(getList.includes(value)){
				if(this[arr][getList.indexOf(value)]){
					res = this[arr][getList.indexOf(value)];
				}
			}
		}
		return res;
	}

	sendCmd(){
		if (this.fhemDevice){
			const currentCommand = this.getArrValue('data_setOn', 'unrecognized');
			if(currentCommand !== 'unrecognized'){
				const command = this.data_setOn[this.data_setOn.indexOf(currentCommand) + 1] ? this.data_setOn[this.data_setOn.indexOf(currentCommand) + 1] : this.data_setOn[0];
				if (this.data_setReading !== '') {
					this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
				} else {
					this.fhem.set(this.fhemDevice.device, command);
				}
			}
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	static getSettings() {
		return {
			name: 'Button Multistate',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_getOn', default: 'on,off'},
				{variable: 'data_setOn', default: 'on,off'},
				{variable: 'data_label', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'data_iconSize', default: '20'},
				{variable: 'bool_data_iconOnly', default: false},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'arr_icon_icons', default: 'add-circle,close-circle'},
				{variable: 'arr_style_labelColors', default: '#fff,#ddd'},
				{variable: 'arr_style_buttonColors', default: '#86d993,#272727'},
				{variable: 'arr_style_iconColors', default: '#2ec6ff,#272727'}
			],
			dependencies: {
				data_iconSize: { dependOn: 'bool_data_iconOnly', value: false },
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true }
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemButtonMultistateComponent]
})
class FhemButtonMultistateComponentModule {}