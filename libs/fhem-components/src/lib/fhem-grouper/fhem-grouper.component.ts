import { Component, Input } from '@angular/core';
import { map } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { ComponentLoaderModule, EditButtonComponent } from '@fhem-native/components';

import { EditorService, StructureService } from '@fhem-native/services';

import { ComponentPosition, FhemComponentSettings } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-grouper',
	templateUrl: './fhem-grouper.component.html',
	styleUrls: ['../fhem-box/fhem-box.component.scss'],
	imports: [
		FhemComponentModule,
		EditButtonComponent,
        ComponentLoaderModule
	]
})
export class FhemGrouperComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() info!: string;

	// component reference
	component: FhemComponentSettings|undefined;
	showEditBtn$ = this.editor.core.getMode().pipe( map(x=>{
		if( !this.component || this.component.components === undefined ) return false;
		return x.edit && x.editFrom !== this.component.components[0].containerUID
	}));

	constructor(private editor: EditorService, private structure: StructureService){}

	onInitComponent(): void{
		// get component for container creation
		const component = this.structure.getComponent(this.UID);
		if(component && component.components) this.component = (component as FhemComponentSettings);
	}

    switchToEditMode(): void{
		if(this.component && this.component.components) this.editor.core.enterEditMode(this.component.components[0].containerUID);
    }
}