import { ChangeDetectionStrategy, Component, HostBinding, Input, Type, ViewContainerRef } from '@angular/core';


import { ColorService, ComponentLoaderService, EditorService, IconService, SettingsService, StructureService, UndoRedoService } from '@fhem-native/services';

import { decimalRounder, leaf } from '@fhem-native/utils';
import { ComponentCategories, ComponentTypes } from '@fhem-native/app-config';
import { ComponentPosition, FhemComponentSettings } from '@fhem-native/types/components';

@Component({
	selector: 'fhem-native-room-component-creator',
	templateUrl: './component-creator.component.html',
	styleUrls: ['./component-creator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class RoomComponentCreatorComponent{
    componentTypes = ComponentTypes;
    componentCategories = ComponentCategories;
    newComponent: Type<any>|undefined;

    componentEditor$ = this.editor.component.getMode();

    @Input() expandState = false;

    trackByFn(index:any){ return index; }
    keepOrder = (a: any, b: any) => {return a;}

    @HostBinding('class.expanded') get expandBinding(){ return this.expandState; }

    constructor(
        public icon: IconService,
        public colors: ColorService,
        public editor: EditorService,
        public settings: SettingsService,
        private structure: StructureService,
        private undoManager: UndoRedoService,
        private compLoader: ComponentLoaderService){
    }

    closeMenu(): void{
        this.editor.revertComponent();
        this.editor.component.leaveEditMode();
	}

    /**
     * Select a component from new component menu
     * @param compRef 
     */
    async selectComponent(compRef: string): Promise<void>{
        // get component configuration
        this.newComponent = await this.compLoader.importFhemComponent(compRef);
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
        const compInputs = this.editor.currentComponentConfig?.inputs;
        const compDependencies = this.editor.currentComponentConfig?.dependencies;

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
        if(!componentSettings || !containerRegistry || !this.editor.currentComponentConfig) return;

        // get relevant config
        const componentConfig = this.compLoader.getFhemComponentConfig(this.editor.currentComponentConfig, (componentSettings as FhemComponentSettings));
        // update component in view
        this.editor.updateComponentInView(containerRegistry, componentConfig);
    }

    /**
     * Save component/modify and update
     */
    saveComponent(): void{
        const componentEditor = this.editor.component.getCurrentMode();
        
        if(this.editor.currentComponentConfig && componentEditor.containerId){
            const containerRegistry = this.compLoader.getContainerRegistry(componentEditor.containerId);
            const compContainer = this.structure.getComponentContainer(componentEditor.containerId);

            if(containerRegistry && compContainer){
                if(this.newComponent){
                    // new component
                    const fhemComponentConfig = this.compLoader.getFhemComponentConfig(this.editor.currentComponentConfig);
                    // transform dimensions to percentage
                    fhemComponentConfig.position = this.getPercentagePosition(fhemComponentConfig, containerRegistry.container, compContainer);
                    // add to view
                    this.compLoader.addFhemComponent(containerRegistry, fhemComponentConfig, this.newComponent);
                    // add to structure
                    this.structure.addComponent(compContainer, fhemComponentConfig);

                    // mark as change
                    this.undoManager.addChange();

                    // reset component reference
                    this.newComponent = undefined;
                }
                else if(componentEditor.componentUID){
                    // component already exist --> apply changes
                    // get component from structure
                    const componentSettings = this.structure.getComponent(componentEditor.componentUID);
                    if(componentSettings){
                        // get current config
                        const currentComponentSettings = this.compLoader.getFhemComponentConfig(this.editor.currentComponentConfig, (componentSettings as FhemComponentSettings));

                        // look for changes
                        if(JSON.stringify(currentComponentSettings) !== JSON.stringify(componentSettings)){
                            // update component in structure
                            this.structure.updateComponent(containerRegistry.containerId, currentComponentSettings);
                            // update component in view
                            this.editor.updateComponentInView(containerRegistry, currentComponentSettings);
                             // mark as change
                            this.undoManager.addChange();
                        }
                    }
                }
            }
            // leave editor
            this.editor.component.leaveEditMode();
        }
    }

    private getPercentagePosition(componentConfig: FhemComponentSettings, container: ViewContainerRef, compContainer: FhemComponentSettings[]): ComponentPosition{
        const containerDimensions: HTMLElement = container.element.nativeElement.parentNode;
        const maxZindex = compContainer.length ? Math.max(...compContainer.map(x=> x.position.zIndex)) : 1;

        return {
            top: componentConfig.position.top,
            left: componentConfig.position.left,
            width: decimalRounder(( parseInt(componentConfig.position.width) / containerDimensions.offsetWidth ) * 100, this.structure.getGridDecimal()) + '%',
            height: decimalRounder(( parseInt(componentConfig.position.height) / containerDimensions.offsetHeight ) * 100, this.structure.getGridDecimal()) + '%',
            zIndex: maxZindex + 1
        }
    }
}