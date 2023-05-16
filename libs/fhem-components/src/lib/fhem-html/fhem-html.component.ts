import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { TextBlockModule } from '@fhem-native/components';
import { TextPosition, TextStyle, getFontStyleFromSelection, getFontWeightFromSelection } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';
import { ThemeService } from '@fhem-native/services';

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
			<div #HTML class="fhem-native-html font-b"
				[ngClass]="htmlText ? 'present' : 'error'"
				[ngStyle]="{
					'font-weight': labelFontWeight,
					'font-style': labelFontStyle,
					'text-align': customTextProperties ? textAlign : 'left',
					'color': customTextProperties ? textColor : (textColor$ | async)
				}">
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

	// Selections
	@Input() textStyle!: TextStyle;
	@Input() textAlign!: TextPosition;

	// Styling
	@Input() textColor!: string;

	// Bool
	@Input() customTextProperties!: boolean;

	// text style
	labelFontWeight = 400;
	labelFontStyle = 'normal';
	textColor$ = this.theme.getThemePipe('--text-a');

	htmlText: string|undefined;
	private rendererEl: HTMLElement|undefined;

	constructor(private renderer: Renderer2, private theme: ThemeService){}

	onInitComponent(): void{
		if(this.rawHtml !== '') {
			this.htmlText = this.rawHtml;
			this.insertHtml();
		}

		if(this.customTextProperties){
			this.labelFontStyle = getFontStyleFromSelection(this.textStyle);
			this.labelFontWeight = getFontWeightFromSelection(this.textStyle);
		}
	}

	setFhemDevice(device: FhemDevice): void{
		if(device && device.readings[this.reading]){
			this.htmlText = device.readings[this.reading].Value;
			this.insertHtml();
		}
	}

	private insertHtml(): void{
		if(this.rendererEl && this.htmlContainer) this.renderer.removeChild(this.htmlContainer, this.rendererEl);
		// create elem
		this.rendererEl = this.renderer.createElement('div');
		// add to view
		this.renderer.appendChild(this.htmlContainer?.nativeElement, this.rendererEl);
		this.renderer.setProperty(this.rendererEl, 'innerHTML', this.htmlText);
	}
}