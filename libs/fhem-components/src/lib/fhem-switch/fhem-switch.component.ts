import { Component, Input } from '@angular/core';

import { SwitchModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
    imports: [  SwitchModule, FhemComponentModule ],
	selector: 'fhem-native-switch-component',
	templateUrl: './fhem-switch.component.html',
    styles: [
        '.fhem-native-switch {width: 100%; height: 100%; pointer-events: all;}',
        'fhem-native-switch {width: 100%; height: 100%; display: flex;}'
    ]
})
export class FhemSwitchComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;

    @Input() getOn!: string;
    @Input() getOff!: string;
    @Input() setOn!: string;
    @Input() setOff!: string;

    @Input() label!: string;
    @Input() info!: string;

    // Selections
    @Input() style!: 'toggle'|'toggle-outline';

	// Styling
    @Input() labelColor!: string;
	@Input() infoColor!: string;
	@Input() backgroundColorOn!: string;
	@Input() backgroundColorOff!: string;
    @Input() knobColorOn!: string;
    @Input() knobColorOff!: string;

	// Bool
	@Input() customLabels!: boolean;
    @Input() customLabelColors!: boolean;

    toggleState = false;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService){}

	getToggleState(device: FhemDevice): void{
		this.fhemDevice = device;
		this.toggleState = this.fhem.deviceReadingActive(device, this.reading, this.getOn);
	}

    toggle(){
        if(!this.fhemDevice) return;

        const command: string = this.toggleState ? this.setOff : this.setOn;

        if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, command);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, command);
    }
}