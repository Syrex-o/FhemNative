import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { IconModule } from '@fhem-native/components';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-icon',
	template: `
        <fhem-native-component 
            [UID]="UID" 
            [position]="position"
            [minDimensions]="{width: 30, height: 30}"
            [fhemDeviceConfig]="{
                device, reading,
                readingAvailable: (device !== '' && reading !== '') ? true : false
            }"
            (initComponent)="onInitComponent()"
            (initDevice)="setFhemDevice($event)"
            (updateDevice)="setFhemDevice($event)">
            <div class="fhem-native-icon" [class.show-indicator]="showIndicator && indicatorValue" [ngClass]="indicatorPosition" >
                <!-- indicator -->
                <div *ngIf="showIndicator && indicatorValue" class="indicator"
                    [ngStyle]="{
                        'color': indicatorColor,
                        'background-color': indicatorBackgroundColor
                    }">
                    <p class="no-margin size-e-app bold">{{indicatorValue}}</p>
                </div>
                <!-- main icon -->
                <fhem-native-icon class="main-icon" [icon]="iconState ? iconOn : iconOff" [style.color]="iconColor" [style.transform]="'rotate('+rotation+'deg)'"></fhem-native-icon>
            </div>
        </fhem-native-component>
    `,
	styleUrls: ['./fhem-icon.component.scss'],
	imports: [FhemComponentModule, IconModule]
})
export class FhemIconComponent{

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() indicatorReading!: string

    @Input() getOn!: string;
    @Input() getOff!: string;

    @Input() min!: string;
    @Input() max!: string;

    @Input() rotation!: number;

    // Selections
	@Input() indicatorPosition!: string;

    // Icons
    @Input() iconOn!: string;
    @Input() iconOff!: string;

    // Styling
	@Input() iconColorOn!: string;
	@Input() iconColorOff!: string;
    @Input() indicatorColor!: string;
    @Input() indicatorBackgroundColor!: string;

    @Input() minColor!: string;
    @Input() maxColor!: string;

	// Bool
	@Input() showIndicator!: boolean;

    iconState = false;
    iconColor: string|undefined;
    indicatorValue: string|undefined;
	fhemDevice: FhemDevice|undefined;

    constructor(private fhem: FhemService){}

    onInitComponent(): void{
        if(!this.fhemDevice) this.iconColor = this.iconColorOff;
    }

    setFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
        this.iconState = this.fhem.deviceReadingActive(device, this.reading, this.getOn);
        if(this.showIndicator && device.readings[this.indicatorReading]) this.indicatorValue = device.readings[this.indicatorReading].Value;
        this.iconColor = this.getIconColor();
    }

    private getIconColor(): string{
        const defaultColor = this.iconState ? this.iconColorOn : this.iconColorOff;
        if(!this.fhemDevice || !this.fhemDevice.readings[this.reading]) return defaultColor;
        
        const currVal = this.fhemDevice.readings[this.reading].Value;
        if(isNaN(currVal)){
            // reading is string
            if(this.min !== '' && this.fhemDevice.readings[this.reading].Value === this.min) return this.minColor;
            if(this.max !== '' && this.fhemDevice.readings[this.reading].Value === this.max) return this.maxColor;
        }else{
            // reading is number
            if(this.min !== '' && this.fhemDevice.readings[this.reading].Value < parseFloat(this.min)) return this.minColor;
            if(this.max !== '' && this.fhemDevice.readings[this.reading].Value > parseFloat(this.max)) return this.maxColor;
        }
        return defaultColor;
    }
}