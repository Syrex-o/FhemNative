import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { ComponentPosition } from '@fhem-native/types/components';
import { TextBlockModule } from '@fhem-native/components';
import { FhemDevice } from '@fhem-native/types/fhem';

@Component({
	standalone: true,
	selector: 'fhem-native-component-html',
	template: `
        <fhem-native-component 
            [UID]="UID" 
            [position]="position"
            [minDimensions]="{width: 30, height: 30}"
            [fhemDeviceConfig]="{
                device, reading,
                connected: rawHtml === '' ? true : false,
                readingAvailable: (device !== '' && reading !== '') ? true : false
            }"
            (initComponent)="onInitComponent()"
            (initDevice)="setFhemDevice($event)"
            (updateDevice)="setFhemDevice($event)">
            <div class="fhem-native-html" [ngClass]="htmlText ? 'present' : 'error'"  #HTML>
                <!-- no html available -->
                <fhem-native-text-block *ngIf="!htmlText"
                    [label]="('COMPONENTS.Html.ERRORS.NO_HTML.name' | translate)"
                    [info]="('COMPONENTS.Html.ERRORS.NO_HTML.info' | translate)">
                </fhem-native-text-block>
            </div>
        </fhem-native-component>
    `,
	styleUrls: ['./fhem-html.component.scss'],
	imports: [FhemComponentModule, TextBlockModule]
})
export class FhemHtmlComponent{
    @ViewChild('HTML', { read: ElementRef, static: false }) htmlContainer: ElementRef|undefined;

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() rawHtml!: string

    htmlText: string|undefined;
	private rendererEl: HTMLElement|undefined;

    constructor(private renderer: Renderer2){}

    onInitComponent(): void{
        if(this.rawHtml !== '') {
            this.htmlText = this.rawHtml;
            this.insertHtml();
        }
    }

    setFhemDevice(device: FhemDevice): void{
        if(device && device.readings[this.reading]){
            this.htmlText =  device.readings[this.reading].Value;
            this.insertHtml();
        }
    }

    private insertHtml(): void{
        if(this.rendererEl && this.htmlContainer) this.renderer.removeChild(this.htmlContainer, this.rendererEl);
        // create elem
        this.rendererEl = this.renderer.createElement('div');
        this.renderer.appendChild(this.htmlContainer?.nativeElement, this.rendererEl);
		this.renderer.setProperty(this.rendererEl, 'innerHTML', this.htmlText);
    }
}