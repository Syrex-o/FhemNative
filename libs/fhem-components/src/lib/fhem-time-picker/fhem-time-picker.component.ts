import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component';
import { TimepickerComponent } from '@fhem-native/components';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ 
		FhemComponentModule,
		TimepickerComponent
	],
	selector: 'fhem-native-component-time-picker',
	template: `
		<fhem-native-component
			[UID]="UID" 
			[position]="position"
			[minDimensions]="{width: 100, height: 40}"
			[fhemDeviceConfig]="{
				device, reading,
				readingAvailable: true
			}"
			(initDevice)="getTimepickerState($event)"
			(updateDevice)="getTimepickerState($event)">
			<div class="fhem-native-timepicker">
				<fhem-native-timepicker
					[(ngModel)]="value" 
					[actOnCallback]="true"
					[showInfoBubble]="false"
					[maxHours]="maxHours"
					[maxMinutes]="maxMinutes"
					[confirmBtn]="confirmBtn"
					[cancelBtn]="cancelBtn"
					[label]="customLabels && label !== '' ? label : device"
					[info]="customLabels && info !== '' ? info : ''"
					[labelColor]="customLabelColors ? labelColor : undefined"
					[infoColor]="customLabelColors ? infoColor : undefined"
					[timeColor]="customLabelColors ? timeColor : undefined"
					(timeChanged)="updateTime($event)">
				</fhem-native-timepicker>
			</div>
		</fhem-native-component>
	`,
	styles: [
        '.fhem-native-timepicker {width: 100%; height: 100%; pointer-events: all;}',
        'fhem-native-timepicker {width: 100%; height: 100%; display: flex;}'
    ]
})
export class FhemTimepickerComponent{
    // meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

    // Data
	@Input() device!: string;
	@Input() reading!: string;
	@Input() setReading!: string;

	@Input() label!: string;
    @Input() info!: string;

    @Input() confirmBtn!: string;
    @Input() cancelBtn!: string;

	@Input() maxHours!: number;
    @Input() maxMinutes!: number;

	// Styling
    @Input() labelColor!: string;
	@Input() infoColor!: string;
	@Input() timeColor!: string;

	// Bool
	@Input() customLabels!: boolean;
    @Input() customLabelColors!: boolean;


    value = '';
	fhemDevice: FhemDevice|undefined;

    constructor(private fhem: FhemService){}

    getTimepickerState(device: FhemDevice): void{
        this.fhemDevice = device;
        this.value = device.readings[this.reading].Value;
    }

    updateTime(time: string): void{
		if(!this.fhemDevice) return;

		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, time);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, time);
    }
}