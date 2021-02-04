import { Component, Input, NgModule, OnInit, OnDestroy} from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
import { TranslateModule } from '@ngx-translate/core';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { VariableService } from '../../../services/variable.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-select',
	templateUrl: './fhem-select.component.html',
	styleUrls: ['./fhem-select.component.scss']
})
export class FhemSelectComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_currentState: string;
	@Input() data_setReading: string;

	@Input() data_seperator: string;
	@Input() data_items: string;
	@Input() data_alias: string;
	@Input() data_placehoder: string;

	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;

	// variable setter
	@Input() data_fixed_var_variable: string;

	@Input() bool_data_customBorder: boolean;
	@Input() bool_data_useForVariables: boolean;

	@Input() style_borderColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;
	@Input() rotation: string;

	fhemDevice: any;
	// list itmes
	items: string[] = [];
	alias: string[] = [];
	// selected item
	selected: string;

	ngOnInit(){
		// get fhem values if needed
		if(!this.bool_data_useForVariables){
			this.fhem.getDevice(this.ID, this.data_device, (device)=>{
				this.getState(device);
			}).then(device=>{
				this.getState(device);
				if(device){
					this.initValues();
				}
			});
		}else{
			// get static variables
			this.initValues();
			let foundVariable = this.variable.variables.find(x=> x.defSyntax === this.data_fixed_var_variable);
			if(foundVariable && foundVariable.modValue && foundVariable.attributes.type === 'static'){
				this.selected = foundVariable.modValue;
			}
		}
	}

	private initValues(){
		// get initial items
		if (this.data_items !== '') {
			this.items = this.data_items.replace(/\s/g, '').split(this.data_seperator);
		}
		// get alias values
		if (this.data_alias !== '') {
			this.alias = this.data_alias.replace(/\s/g, '').split(this.data_seperator);
		}
	}

	private getState(device){
		this.fhemDevice = device;
		if(device){
			// check for list items
			// manual list has priority
			if(this.data_items === '' && this.fhemDevice.readings[this.data_reading]){
				this.items = this.fhemDevice.readings[this.data_reading].Value.replace(/\s/g, '').split(this.data_seperator);
			}
			// check for current state
			if (this.data_currentState !== '' && this.fhemDevice.readings[this.data_currentState]) {
				this.selected = this.fhemDevice.readings[this.data_currentState].Value;
			}else{
				this.selected = (this.data_placehoder === '') ? this.data_device : this.data_placehoder;
			}
		}
	}

	// select item from list
	changeSelection(item: any){
		// check if value is an alias
		let index;
		if(this.alias.length > 0){
			index = this.alias.indexOf(item);
		}else{
			index = this.items.indexOf(item);
		}
		if(index > -1 && this.items[index]){
			// fhem command
			if(!this.bool_data_useForVariables){
				this.sendValue(this.items[index]);
			}else{
				// variable modification
				this.variable.updateStaticVariable(this.data_fixed_var_variable, item);
			}
		}
	}

	private sendValue(val: any){
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
		} else {
			this.fhem.set(this.fhemDevice.device, val);
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		private native: NativeFunctionsService,
		public settings: SettingsService,
		private variable: VariableService) {
	}

	static getSettings() {
		return {
			name: 'Select',
			type: 'fhem',
			inputs: [
				{variable: 'data_fixed_var_variable', default: ''},
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_currentState', default: ''},
				{variable: 'data_seperator', default: ','},
				{variable: 'data_items', default: ''},
				{variable: 'data_alias', default: ''},
				{variable: 'data_placehoder', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'bool_data_useForVariables', default: false},
				{variable: 'style_borderColor', default: '#565656'}
			],
			dependencies: {
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },
				// variable 
				data_device: { dependOn: 'bool_data_useForVariables', value: false },
				data_reading: { dependOn: 'bool_data_useForVariables', value: false },
				data_setReading: { dependOn: 'bool_data_useForVariables', value: false },
				// variable setter (will not be overwritten)
				data_fixed_var_variable: { dependOn: 'bool_data_useForVariables', value: true }
			},
			dimensions: {minX: 80, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
	declarations: [FhemSelectComponent]
})
class FhemSelectComponentModule {}