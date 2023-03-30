import { Injectable, ViewContainerRef } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { UndoRedoService } from "./undo-redo.service";
import { StructureService } from "./structure.service";
import { ComponentLoaderService } from "./component-loader.service";
import { SelectComponentService } from "./select-component.service";

import { ComponentConfigEditor, ComponentEditor, ComponentPosition, ComponentSettings, ContainerRegistry, EditMode, FhemComponentSettings } from "@fhem-native/types/components";
import { decimalRounder } from "@fhem-native/utils";

@Injectable({providedIn: "root"})
export class EditorService {
	/**
	 * Core Editor
	 * Tell the environment about current mode and where to edit
	 */
	private mode = new BehaviorSubject<EditMode>({ edit: false, editComponents: false, editFrom: null });

	/**
	 * Component Editor
	 * Tell the environment about component creation/edit
	 */
	private componentEditor = new BehaviorSubject<ComponentEditor>({ edit: false, componentUID: null, containerId: null });

	/**
	 * Holder of current component configuration, while editing
	 */
	private componentConfigEditor = new BehaviorSubject<ComponentConfigEditor>({new: null, componentConfig: null});

	constructor(
		protected structure: StructureService,
		protected undoManager: UndoRedoService,
		protected compLoader: ComponentLoaderService,
		protected selectComponent: SelectComponentService){
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
			if(!this.core.getCurrentMode().edit) this.undoManager.init();

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
			// check for current component config
			if(this.componentConfigEditor.value.componentConfig) this.saveComponent();

			this.core.leaveEditMode();
			await this.undoManager.applyChanges();
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
			// this.currentComponentConfig = null;
			this.componentConfigEditor.next({new: null, componentConfig: null});
			this.componentEditor.next({ edit: true, componentUID: componentUID || null, containerId: containerId });
		},
		/**
		 * Switch back to normal mode
		 */
		leaveEditMode: (): void => {
			this.componentConfigEditor.next({new: null, componentConfig: null});
			this.componentEditor.next({ edit: false, componentUID: null, containerId: null });
			// reset undo redo manager
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
		editComponent: async (componentConfig: ComponentSettings, containerId: string, componentUID?: string) =>{
			const newComponent = componentUID ? null : await this.compLoader.importFhemComponent(componentConfig.name);
			this.componentConfigEditor.next({new: newComponent, componentConfig: componentConfig});

			// = {new: componentUID ? true : false, componentConfig: componentConfig};
			// this.currentComponentConfig = componentConfig;
			this.componentEditor.next({ edit: true, componentUID: componentUID || null, containerId: containerId });
		}
	}

	public getComponentConfigEditor() {
		return this.componentConfigEditor;
	}

	saveComponent(): void{
		if(!this.componentConfigEditor.value.componentConfig || !this.componentEditor.value.containerId) return;
		
		const containerRegistry = this.compLoader.getContainerRegistry(this.componentEditor.value.containerId);
		const compContainer = this.structure.getComponentContainer(this.componentEditor.value.containerId);
		if(!containerRegistry || !compContainer) return;

		if(this.componentConfigEditor.value.new){
			// new component
			const fhemComponentConfig = this.compLoader.getFhemComponentConfig(this.componentConfigEditor.value.componentConfig);
			// transform dimensions to percentage
			fhemComponentConfig.position = this.getPercentagePosition(fhemComponentConfig, containerRegistry.container, compContainer);
			// add to view
			this.compLoader.addFhemComponent(containerRegistry, fhemComponentConfig, this.componentConfigEditor.value.new);
			// add to structure
			this.structure.addComponent(compContainer, fhemComponentConfig);
			// mark as change
			this.undoManager.addChange();
		}
		else if(this.componentEditor.value.componentUID){
			// component already exist --> apply changes
			// get component from structure
			const componentSettings = this.structure.getComponent(this.componentEditor.value.componentUID);
			if(!componentSettings) return;

			// get current config
			const currentComponentSettings = this.compLoader.getFhemComponentConfig(this.componentConfigEditor.value.componentConfig, (componentSettings as FhemComponentSettings));
			// look for changes
			if(JSON.stringify(currentComponentSettings) !== JSON.stringify(componentSettings)){
				// update component in structure
				this.structure.updateComponent(containerRegistry.containerId, currentComponentSettings);
				// update component in view
		        this.updateComponentInView(containerRegistry, currentComponentSettings);
		        // mark as change
		        this.undoManager.addChange();
			}
		}
		this.component.leaveEditMode();
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
	public async revertComponent(){
		if(this.componentEditor.value.componentUID && this.componentEditor.value.containerId){
			let componentSettings = this.structure.getComponent(this.componentEditor.value.componentUID);
			if(!componentSettings) return;

			// get uncompressed config
			componentSettings = await this.compLoader.getUpdatedFhemComponentConfig(componentSettings);

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