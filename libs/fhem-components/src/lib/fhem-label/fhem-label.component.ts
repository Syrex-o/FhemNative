import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { TextBlockModule } from '@fhem-native/components';
import { commaListToArray, getFontStyleFromSelection, getFontWeightFromSelection, TextPosition, TextStyle, IsJsonString, TextPositionVertical } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-label',
	template: `
		<fhem-native-component 
			[UID]="UID" 
			[position]="position"
			[minDimensions]="{width: 60, height: 40}"
			[fhemDeviceConfig]="{
				device, reading,
				readingAvailable: (device !== '' && reading !== '') ? true : false
			}"
			(initComponent)="onInitComponent()"
			(initDevice)="setFhemDevice($event)"
			(updateDevice)="setFhemDevice($event)">
			<div class="fhem-native-label" [class.error]="_label === undefined || _label === ''">
				<ng-container *ngIf="_label !== undefined && _label !== ''; else ERROR">
					<p class="label" 
					[ngStyle]="{
						'font-size.px': size, 
						'line-height.px': size,
						'font-weight': labelFontWeight,
						'font-style': labelFontStyle,
						'text-align': textAlign,
						'color': fhemDevice ? labelColor : color,
						'top': labelPositionT,
						'transform': 'rotate('+rotation+'deg) ' + labelPositionTF
					}">
						{{_label}}{{labelExtension}}
					</p>
				</ng-container>

				<ng-template #ERROR>
					<fhem-native-text-block
						[label]="('COMPONENTS.Label.ERRORS.NO_LABEL.name' | translate)"
						[info]="('COMPONENTS.Label.ERRORS.NO_LABEL.info' | translate)">
					</fhem-native-text-block>
				</ng-template>
			</div>
		</fhem-native-component>
	`,
	styleUrls: ['./fhem-label.component.scss'],
	imports: [FhemComponentModule, TextBlockModule]
})
export class FhemLabelComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
	@Input() reading!: string;
	
	@Input() label!: string;
	@Input() items!: string;
	@Input() alias!: string;

	@Input() labelExtension!: string;
	@Input() rotation!: number;
	@Input() size!: number;
	@Input() min!: number;
	@Input() max!: number;

	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

	// Selections
	@Input() textStyle!: TextStyle;
	@Input() textAlign!: TextPosition;
	@Input() textAlignVert!: TextPositionVertical;

	// Styling
	@Input() color!: string;
	@Input() minColor!: string;
	@Input() maxColor!: string;

	// Bool
	@Input() useAlias!: boolean;
	@Input() useMinMax!: boolean;

	// header style
	labelFontWeight = 400;
	labelFontStyle = 'normal';

	_items: unknown[] = [];
	_alias: unknown[] = [];

	_label: unknown|undefined;
	labelColor: string|undefined;
	fhemDevice: FhemDevice|undefined;

	labelPositionT: string|undefined;
	labelPositionTF: string|undefined;

	onInitComponent(): void{
		this._label = this.label;
		
		if(this.useAlias){
			this._items = commaListToArray(this.items);
			this._alias = commaListToArray(this.alias);
		}

		this.labelFontStyle = getFontStyleFromSelection(this.textStyle);
		this.labelFontWeight = getFontWeightFromSelection(this.textStyle);

		this.labelPositionT = `${this.textAlignVert === 'center' ? '50' : (this.textAlignVert === 'bottom' ? '100' : '0')}%`;
		this.labelPositionTF = `translate3d(0,${this.textAlignVert === 'center' ? '-50' : (this.textAlignVert === 'bottom' ? '-100' : '0')}%,0)`;
	}

	setFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
		const label = device.readings[this.reading].Value;
		// get alias
		this._label = this.getValueLabel(label);
		this.labelColor = this.getValueColor();
	}

	private getValueLabel(currentVal: string): unknown{
		if(!this.useAlias) return currentVal;

		for(let i = 0; i < this._items.length; i++){
			const item = this._items[i] as any;
			let val: string|number|boolean = item;

			if(!isNaN(item)) val = parseFloat(item);
			if(IsJsonString(item)) val = JSON.parse(item);

			// check matching
			if(val === currentVal) return this._alias[i] || currentVal;
		}
		return currentVal;
	}

	private getValueColor(): string{
		if(!this.useMinMax) return this.color;
		if(!this.fhemDevice || !this.fhemDevice.readings[this.reading]) return this.color;

		if(!isNaN(this.fhemDevice.readings[this.reading].Value)){
			if(this.fhemDevice.readings[this.reading].Value < this.min) return this.minColor;
			if(this.fhemDevice.readings[this.reading].Value > this.max) return this.maxColor;
			// use default
			return this.color;
		}
		return this.color;
	}
}