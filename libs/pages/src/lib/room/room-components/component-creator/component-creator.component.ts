import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';


import { ColorService, ComponentLoaderService, EditorService, IconService, SettingsService, StructureService } from '@fhem-native/services';

import { leaf } from '@fhem-native/utils';
import { ComponentCategories, ComponentTypes } from '@fhem-native/app-config';
import { FhemComponentSettings } from '@fhem-native/types/components';

@Component({
	selector: 'fhem-native-room-component-creator',
	templateUrl: './component-creator.component.html',
	styleUrls: ['./component-creator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class RoomComponentCreatorComponent{
    componentTypes = ComponentTypes;
    componentCategories = ComponentCategories;
    // newComponent: Type<any>|undefined;

    componentEditor$ = this.editor.component.getMode();
    componentConfigEditor$ = this.editor.getComponentConfigEditor();

    @Input() expandState = false;

    trackByFn(index:any){ return index; }
    keepOrder = (a: any, b: any) => {return a;}

    @HostBinding('class.expanded') get expandBinding(){ return this.expandState; }

    constructor(
        public icon: IconService,
        public colors: ColorService,
        private editor: EditorService,
        public settings: SettingsService,
        private structure: StructureService,
        private compLoader: ComponentLoaderService){
    }

    async closeMenu(){
        await this.editor.revertComponent();
        this.editor.component.leaveEditMode();
	}

    /**
     * Select a component from new component menu
     * @param compRef 
     */
    async selectComponent(compRef: string): Promise<void>{
        // get component configuration
        // this.newComponent = await this.compLoader.importFhemComponent(compRef);
        const compConfig = await this.compLoader.importFhemComponentConfig(compRef);

        // switch to edit mode of component
        // component is anonym (no UID)
        const componentEditor = this.editor.component.getCurrentMode();
        if(componentEditor.containerId) this.editor.component.editComponent(compConfig, componentEditor.containerId);
    }

    /**
     * Check if settings should be hidden
     * @param inputRef inputs object reference
     * @param settingsKey Settings key value
     * @returns bool to hide/show setting
     */
    checkForHideSetting(inputRef: string, settingsKey: string): boolean{
        const compEditor = this.componentConfigEditor$.value;
        const compInputs = compEditor.componentConfig?.inputs;
        const compDependencies = compEditor.componentConfig?.dependencies;

        // const compInputs = this.editor.currentComponentConfig?.inputs;
        // const compDependencies = this.editor.currentComponentConfig?.dependencies;

        if(compDependencies && compInputs){
            // get relevant dependency
            const relDependency = compDependencies[ (inputRef + '.' + settingsKey) ];
            if(relDependency){
                // check all dependency values
                for(let i = 0; i < relDependency.dependOn.length; i++){
                    const refValue = leaf(compInputs, relDependency.dependOn[i] );
                    // check if result is object (arr_data)
                    // compare values
                    if(
                        ( 
                            (typeof refValue === 'object' && refValue !== null) ? 
                            refValue.value : 
                            refValue
                        ) !== relDependency.value[i]
                    ){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * update component
     * Update just in view --> does not apply undo redo button
     */
    previewComponent(): void{
        const componentEditor = this.editor.component.getCurrentMode();

        const componentSettings = this.structure.getComponent(componentEditor.componentUID || '');
        const containerRegistry = this.compLoader.getContainerRegistry(componentEditor.containerId || '');
        if(!componentSettings || !containerRegistry || !this.componentConfigEditor$.value.componentConfig) return;

        // get relevant config
        const componentConfig = this.compLoader.getFhemComponentConfig(this.componentConfigEditor$.value.componentConfig, (componentSettings as FhemComponentSettings));
        // update component in view
        this.editor.updateComponentInView(containerRegistry, componentConfig);
    }

    /**
     * Save component/modify and update
     */
    saveComponent(): void{
        this.editor.saveComponent();
    }
}