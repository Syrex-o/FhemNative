import { Component, Input } from '@angular/core';
import { map } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { ComponentLoaderModule, EditButtonComponent } from '@fhem-native/components';

import { EditorService, StructureService } from '@fhem-native/services';
import { getFontStyleFromSelection, getFontWeightFromSelection, TextStyle } from '@fhem-native/utils';

import { ComponentPosition, FhemComponentSettings } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-box-container',
	templateUrl: './fhem-box-container.component.html',
	styleUrls: ['../fhem-box/fhem-box.component.scss'],
	imports: [
		FhemComponentModule,
		EditButtonComponent,
        ComponentLoaderModule
	]
})
export class FhemBoxContainerComponent{
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
	@Input() style!: string;
	@Input() headerStyle!: TextStyle;
	@Input() headerPosition!: string;

	// Styling
	@Input() headerColor!: string;
	@Input() backgroundColor!: string;

	// Bool
	@Input() showHeader!: boolean;
	@Input() showShadow!: boolean;
	@Input() customBorder!: boolean;
	@Input() customNotch!: boolean;

	// header style
	headerFontWeight = 400;
	headerFontStyle = 'normal';

	// component reference
	component: FhemComponentSettings|undefined;
	showEditBtn$ = this.editor.core.getMode().pipe( map(x=>{
		if( !this.component || this.component.components === undefined ) return false;
		return x.edit && x.editFrom !== this.component.components[0].containerUID
	}));

	constructor(private editor: EditorService, private structure: StructureService){}

	onInitComponent(): void{
		this.headerFontStyle = getFontStyleFromSelection(this.headerStyle);
		this.headerFontWeight = getFontWeightFromSelection(this.headerStyle);

		// get component for container creation
		const component = this.structure.getComponent(this.UID);
		if(component && component.components) this.component = (component as FhemComponentSettings);
	}

    switchToEditMode(): void{
		if(this.component && this.component.components) this.editor.core.enterEditMode(this.component.components[0].containerUID);
    }
}