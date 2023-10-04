import { Component, Input, ViewEncapsulation } from '@angular/core';
import { map, tap } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { ComponentLoaderModule, EditButtonComponent, IconModule, PickerComponent } from '@fhem-native/components';

import { EditorService, FhemService, StructureService } from '@fhem-native/services';

import { ComponentPosition, FhemComponentSettings } from '@fhem-native/types/components';
import { FhemDevice } from '@fhem-native/types/fhem';

@Component({
	standalone: true,
	selector: 'fhem-native-component-picker',
	templateUrl: './fhem-picker.component.html',
	styleUrls: ['./fhem-picker.component.scss'],
	imports: [
		IconModule,
		PickerComponent,
		FhemComponentModule,
		EditButtonComponent,
		ComponentLoaderModule
	],
	encapsulation: ViewEncapsulation.None
})
export class FhemPickerComponent {
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
	@Input() reading!: string;
	@Input() getOn!: string;
	@Input() getOff!: string;

	@Input() headline!: string;

	@Input() width!: number;
	@Input() height!: number;

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
	@Input() backgroundColorOn!: string;
	@Input() backgroundColorOff!: string;

	// Bool
	@Input() openOnReading!: boolean;
	@Input() customBorder!: boolean;

	pickerState = false;
	buttonState = false;

	// component reference
	component: FhemComponentSettings|undefined;
	showEditBtn$ = this.editor.core.getMode().pipe( 
		tap(()=> this.getContainer()),
		map(x=>{
			if( !this.component || this.component.components === undefined ) return false;
			return x.edit && x.editFrom !== this.component.components[0].containerUID;
		})
	);

	constructor(private fhem: FhemService, private editor: EditorService, private structure: StructureService){}

	getContainer(): void{
		// get component for container creation
		const component = this.structure.getComponent(this.UID);
		if(component && component.components) this.component = (component as FhemComponentSettings);
	}

	setFhemDevice(device: FhemDevice): void{
		this.buttonState = this.fhem.deviceReadingActive(device, this.reading, this.getOn);
		if(this.openOnReading) this.pickerState = this.buttonState;
	}

	switchToEditMode(): void{
		if(this.component && this.component.components) this.editor.core.enterEditMode(this.component.components[0].containerUID);
	}

	togglePicker(): void{
		this.pickerState = !this.pickerState;
	}
}