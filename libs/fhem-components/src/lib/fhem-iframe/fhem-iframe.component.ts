import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TextBlockModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-iframe',
	template: `
        <fhem-native-component 
            [UID]="UID" 
            [position]="position"
            [minDimensions]="{width: 100, height: 100}"
            [fhemDeviceConfig]="{
                device, reading,
                readingAvailable: (device !== '' && reading !== '') ? true : false
            }"
            (initComponent)="onInitComponent()"
            (initDevice)="setFhemDevice($event)"
            (updateDevice)="setFhemDevice($event)">
            <div class="fhem-native-iframe" [class.error]="!src || src === ''">
                <ng-container *ngIf="src && src !== ''; else ERROR">
                    <iframe [src]="src" [frameBorder]="showBorder ? 1 : 0"></iframe>
                </ng-container>

                <ng-template #ERROR>
                    <fhem-native-text-block
                        [label]="('COMPONENTS.IFrame.ERRORS.NO_SRC.name' | translate)"
                        [info]="('COMPONENTS.IFrame.ERRORS.NO_SRC.info' | translate)">
                    </fhem-native-text-block>
                </ng-template>
            </div>
        </fhem-native-component>
    `,
	styleUrls: ['./fhem-iframe.component.scss'],
	imports: [FhemComponentModule, TextBlockModule]
})
export class FhemIFrameComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() url!: string;

	// Bool
	@Input() showBorder!: boolean;

    src: SafeResourceUrl|undefined;
	fhemDevice: FhemDevice|undefined;

    constructor(private sanitizer: DomSanitizer){}

    onInitComponent(): void{
        if(!this.fhemDevice) this.src = this.url !== '' ? this.sanitizer.bypassSecurityTrustResourceUrl(this.url) : '';
    }

    setFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
        this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.fhemDevice.readings[this.reading].Value);
    }
}