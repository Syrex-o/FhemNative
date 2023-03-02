import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { UndoRedoService } from "./undo-redo.service";
import { StructureService } from "./structure.service";
import { ComponentLoaderService } from "./component-loader.service";
import { SelectComponentService } from "./select-component.service";

import { ComponentEditor, ComponentSettings, ContainerRegistry, EditMode, FhemComponentSettings } from "@fhem-native/types/components";

@Injectable({providedIn: "root"})
export class EditorService {
    /**
     * Core Editor
     * Tell the environment about current mode and where to edit
     */
    private mode: BehaviorSubject<EditMode> = new BehaviorSubject<EditMode>({ edit: false, editComponents: false, editFrom: null });

    /**
     * Component Editor
     * Tell the environment about component creation/edit
     */
    private componentEditor: BehaviorSubject<ComponentEditor> = new BehaviorSubject<ComponentEditor>({ edit: false, componentUID: null, containerId: null });

    /**
     * Holder of current component configuration, while editing
     */
    public currentComponentConfig: ComponentSettings|null = null;

    constructor(
        private structure: StructureService,
        private undoManager: UndoRedoService,
        private compLoader: ComponentLoaderService,
        private selectComponent: SelectComponentService){
    }

    /**
     * Core Editor Functions
     */
    public core = {
        getMode: (): Observable<EditMode> =>{ return this.mode; },
        getCurrentMode: (): EditMode =>{ return this.mode.value; },
        /**
         * Enter edit mode from relevent container id
         * @param id: container ID from editor
         */
        enterEditMode: (id: string): void => {
            // initialize undo manager
            this.undoManager.init();

            this.mode.next({ edit: true, editComponents: true, editFrom: id });
        },

        /**
         * 
         * @param id container ID from editor
         * @param edit value of main editor
         * @param editComponents value of component edit menu
         */
        updateEditMode: (id: string, edit: boolean, editComponents: boolean): void =>{
            this.mode.next({ edit, editComponents, editFrom: id });
            this.core.checkForEnd();
            this.component.checkForLeave(editComponents);
        },

        /**
         * Switch back to normal mode
         */
        leaveEditMode: (): void => {
            this.mode.next({ edit: false, editComponents: false, editFrom: null });
            this.core.checkForEnd();
            // remove component creation menu, when grid is disabled
            this.component.checkForLeave(false);
        },

        /**
         * change component endit mode (grid) 
         * @param toValue: grid display
        */
        switchGridMode: (toValue: boolean): void => {
            this.mode.next({ edit: true, editComponents: toValue, editFrom: this.mode.value.editFrom });
            this.core.checkForEnd();
            // remove component creation menu, when grid is disabled
            this.component.checkForLeave(toValue);
        },

        /**
         * save cahnges of components
        */
        saveChanges: async () => {
            await this.undoManager.applyChanges();
            this.core.leaveEditMode();
        },

        /**
         * Check for end of modes to collect irrelevant data
         */
        checkForEnd: (): void =>{
            if(!this.mode.value.editComponents){
                // clear selection list on grid toggle
                this.selectComponent.clearSelectorList();
            }

            if(!this.mode.value.edit){
                // clear copy list on edit end
                this.selectComponent.clearCopyList();
                // clear undo manager
                this.undoManager.reset();
            }
        }
    };

    /**
     * Component Editor Functions
     */
    public component = {
        getMode: (): Observable<ComponentEditor> =>{ return this.componentEditor; },
        getCurrentMode: (): ComponentEditor =>{ return this.componentEditor.value; },
        /**
         * Enter edit mode for component
         * @param componentUID UID reference to structure component
         */
        enterEditMode: (containerId: string, componentUID?: string): void => {
            this.currentComponentConfig = null;
            this.componentEditor.next({ edit: true, componentUID: componentUID || null, containerId: containerId });
        },
        /**
         * Switch back to normal mode
         */
        leaveEditMode: (): void => {
            this.currentComponentConfig = null;
            this.componentEditor.next({ edit: false, componentUID: null, containerId: null });
            // reset undo redo managerc
        },
        /**
         * Check if component creator should be removed
         * Disabled, when Grid disappears
         */
        checkForLeave: (gridMode: boolean): void =>{
            if(this.componentEditor.value.edit && !gridMode){
                // check if editor was currently active for component
                if(this.componentEditor.value.componentUID) this.revertComponent();

                // leave editr
                this.component.leaveEditMode();
            }
        },
        /**
         * Edit a specific component
         * @param component Dynamic Component class
         * @param componentConfig ComponentSettings
         * @param componentUID UID reference to structure component
         */
        editComponent: (componentConfig: ComponentSettings, containerId: string, componentUID?: string) =>{
            this.currentComponentConfig = componentConfig;
            this.componentEditor.next({ edit: true, componentUID: componentUID || null, containerId: containerId });
        }
    }

    /**
     * Update component in view based on registry reference
     * @param containerRegistry 
     * @param componentSettings 
     */
    public updateComponentInView(containerRegistry: ContainerRegistry, componentSettings: FhemComponentSettings): void{
        const componentRegistry = this.compLoader.getComponentFromRegistry(componentSettings.UID);
        if(!componentRegistry) return;

        // remove component
        componentRegistry.component.destroy();

        // create component
        const compRef = containerRegistry.container.createComponent(componentRegistry.component.componentType);
        this.compLoader.addComponentMeta(compRef, componentSettings);
        this.compLoader.addComponentInputs(compRef, componentSettings);

        // update component reference
        componentRegistry.component = compRef;
    }

    /**
     * Restore component to room config
     */
    public revertComponent(): void{
        if(this.componentEditor.value.componentUID && this.componentEditor.value.containerId){
            const componentSettings = this.structure.getComponent(this.componentEditor.value.componentUID);
            const componentRegistry = this.compLoader.getComponentFromRegistry(this.componentEditor.value.componentUID);
            const containerRegistry = this.compLoader.getContainerRegistry(this.componentEditor.value.containerId);

            if(componentRegistry && componentSettings && containerRegistry){
                // remove component
                componentRegistry.component.destroy();

                // create component
                const compRef = containerRegistry.container.createComponent(componentRegistry.component.componentType);
                this.compLoader.addComponentMeta(compRef, (componentSettings as FhemComponentSettings));
                this.compLoader.addComponentInputs(compRef, (componentSettings as FhemComponentSettings));
                // update reference
                componentRegistry.component = compRef;
            }
        }
    }
}