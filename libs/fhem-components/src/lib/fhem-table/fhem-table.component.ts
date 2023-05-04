import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';
import { commaListToArray } from '@fhem-native/utils';

@Component({
	standalone: true,
	selector: 'fhem-native-component-table',
	templateUrl: 'fhem-table.component.html',
	styleUrls: ['./fhem-table.component.scss'],
	imports: [ FhemComponentModule ]
})
export class FhemTableComponent{

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() headerValues!: string;
    @Input() readingValues!: string;

    // Styling
	@Input() backgroundColor!: string;

	// Bool
    @Input() showAllReadings!: boolean;
	@Input() showReading!: boolean;
    @Input() showValue!: boolean;
    @Input() showTime!: boolean;

    _headerValues: string[] = [];
    _readingValues: string[] = [];
	fhemDevice: FhemDevice|undefined;

    constructor(private fhem: FhemService){}

    getArrValues(): void{
		if(this.headerValues && this.readingValues){
			this._headerValues = commaListToArray(this.headerValues);
            this._readingValues = commaListToArray(this.readingValues);
		}
        if(this.showAllReadings && this.fhemDevice)  this._readingValues = Object.keys(this.fhemDevice.readings);
	}

    setFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
        this.getArrValues();
    }
}