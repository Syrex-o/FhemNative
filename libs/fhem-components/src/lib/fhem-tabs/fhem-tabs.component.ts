import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { map, share, tap } from 'rxjs';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { ComponentLoaderModule, EditButtonComponent, IconModule } from '@fhem-native/components';

import { EditorService, StructureService } from '@fhem-native/services';

import { ComponentPosition, FhemComponentSettings, FhemComponentContainerSettings } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-tabs',
	templateUrl: './fhem-tabs.component.html',
	styleUrls: ['./fhem-tabs.component.scss'],
	imports: [
        IconModule,
        IonicModule,
        EditButtonComponent,
		FhemComponentModule,
        ComponentLoaderModule
	]
})
export class FhemTabsComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
    @Input() containerPages!: number;

    @Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

	// Selections
    @Input() tabPosition!: string;

    // Icons
    @Input() icons!: string[];

	// Styling
    @Input() activeTabColor!: string;
    
	@Input() iconColors!: string[];
    @Input() headerColors!: string[];
	@Input() backgroundColors!: string[];

	// Bool
    @Input() customBorder!: boolean;

    currentTab = 0;

    // component reference
	component: FhemComponentSettings|undefined;
    editFrom$ = this.editor.core.getMode().pipe( 
        tap(()=> this.getContainer()), 
        map(x=> {
            if( !this.component || this.component.components === undefined ) return null;
            return x.edit ? x.editFrom : null;
        })
    );

    constructor(private editor: EditorService, private structure: StructureService){}

    getContainer(): void{
		// get component for container creation
		const component = this.structure.getComponent(this.UID);
		if(component && component.components) this.component = (component as FhemComponentSettings);
	}

    switchToEditMode(compContainer: FhemComponentContainerSettings): void{
        this.editor.core.enterEditMode(compContainer.containerUID);
    }

    switchTab(tabIndex: number): void{
        if(tabIndex !== this.currentTab) this.currentTab = tabIndex;
    }
}