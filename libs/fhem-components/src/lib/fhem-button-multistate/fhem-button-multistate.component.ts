import { Component, Input } from '@angular/core';

import { IconModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService, ToastService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';
import { commaListToArray } from '@fhem-native/utils';

@Component({
	standalone: true,
	imports: [ IconModule, FhemComponentModule ],
	selector: 'fhem-native-button-multistate',
	templateUrl: './fhem-button-multistate.component.html',
	styleUrls: ['../fhem-button/fhem-button.component.scss']
})
export class FhemButtonMultistateComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;
    @Input() sendCommand!: string;

    @Input() getOn!: string;
    @Input() setOn!: string;

    @Input() label!: string;
    @Input() iconSize!: number;
	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

    // Icons
    @Input() icons!: string[];

	// Styling
	@Input() iconColors!: string[];
    @Input() buttonColors!: string[];
    @Input() labelColors!: string[];

	// Bool
	@Input() iconOnly!: boolean;
	@Input() customBorder!: boolean;

	_getOn:string[]|undefined;
	_setOn:string[]|undefined;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService, private toast: ToastService){}

	getArrValues(): void{
		if(this.getOn && this.setOn){
			this._getOn = commaListToArray(this.getOn);
			this._setOn = commaListToArray(this.setOn);
		}
	}

	setFhemDevice(device: FhemDevice): void{ 
		this.fhemDevice = device;
		this.getArrValues();
	}

	// get relevant value from array
	getArrValue(arr: string[], _default?: string): string{
		if(this.fhemDevice && (this.reading in this.fhemDevice.readings)){
			const value = this.fhemDevice.readings[this.reading].Value.toString().toLowerCase();
			const getList = this._getOn?.map(x=> x.toString().toLowerCase());

			if(getList && getList.includes(value) && arr[getList.indexOf(value)]) return arr[getList.indexOf(value)];
		}
		return _default ? _default : (arr[0] ? arr[0] : '#ddd');
	}

	sendCmd() {
		if(!this.fhemDevice || !this._getOn || !this._setOn) return this.toast.addTranslatedToast('COMPONENTS.Button.ERRORS.NO_COMMAND.name', 'COMPONENTS.Button.ERRORS.NO_COMMAND.info', 'info', 4500);

		const currentCommand = this.getArrValue(this._getOn, 'EMPTY');
		if(currentCommand !== 'EMPTY'){
			const command: string = this._setOn[this._setOn.indexOf(currentCommand) + 1] ? this._setOn[this._setOn.indexOf(currentCommand) + 1] : this._setOn[0];

			if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, command);
			return this.fhem.setAttr(this.fhemDevice.device, this.setReading, command);
		}
	}
}