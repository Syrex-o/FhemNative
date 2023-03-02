import { Component, Input } from '@angular/core';

import { IconModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService, ToastService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ IconModule, FhemComponentModule ],
	selector: 'fhem-native-button',
	templateUrl: './fhem-button.component.html',
	styleUrls: ['./fhem-button.component.scss']
})
export class FhemButtonComponent {
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;
    @Input() sendCommand!: string;

    @Input() getOn!: string;
    @Input() getOff!: string;
    @Input() setOn!: string;
    @Input() setOff!: string;

    @Input() label!: string;
    @Input() iconSize!: number;
	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

    // Icons
    @Input() iconOn!: string;
    @Input() iconOff!: string;

	// Styling
	@Input() iconColorOn!: string;
	@Input() iconColorOff!: string;
    @Input() buttonColor!: string;
    @Input() labelColor!: string;

	// Bool
	@Input() iconOnly!: boolean;
	@Input() customBorder!: boolean;

    buttonState = false;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService, private toast: ToastService){}

	getButtonState(device: FhemDevice): void{
		this.fhemDevice = device;
		this.buttonState = this.fhem.deviceReadingActive(device, this.reading, this.getOn);
	}

	sendCmd() {
		// send raw command
		if (this.sendCommand !== '') return this.fhem.sendCommand({command: this.sendCommand});

		if(!this.fhemDevice) return this.toast.addTranslatedToast('COMPONENTS.Button.ERRORS.NO_COMMAND.name', 'COMPONENTS.Button.ERRORS.NO_COMMAND.info', 'info', 4500);

		const command: string = this.buttonState ? this.setOff : this.setOn;
		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, command);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, command);
	}
}