import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { getFontStyleFromSelection, getFontWeightFromSelection, TextStyle } from '@fhem-native/utils';

import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ FhemComponentModule ],
	selector: 'fhem-native-box',
	templateUrl: './fhem-box.component.html',
	styleUrls: ['./fhem-box.component.scss']
})
export class FhemBoxComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() headline!: string;
	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;
	@Input() notchDefinition!: string;

	// Selections
	@Input() headerStyle!: TextStyle;
	@Input() headerPosition!: string;

	// Styling
	@Input() headerColor!: string;
	@Input() backgroundColor!: string;

	// Gradient Styling
	@Input() gradientBackgroundColor!: string[];

	// Bool
	@Input() showHeader!: boolean;
	@Input() showShadow!: boolean;
	@Input() customBorder!: boolean;
	@Input() customNotch!: boolean;
	@Input() gradientBackground!: boolean;

	// header style
	headerFontWeight = 400;
	headerFontStyle = 'normal';

	onInitComponent(): void{
		this.headerFontStyle = getFontStyleFromSelection(this.headerStyle);
		this.headerFontWeight = getFontWeightFromSelection(this.headerStyle);
	}
}