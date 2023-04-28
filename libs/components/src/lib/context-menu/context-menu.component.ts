import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation, OnInit, Inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AddRoomComponent } from '../add-room/add-room.component';
import { ComponentDetailsComponent } from '../component-details/component-details.component';

import { TransformationItemDirective, TransformationManagerDirective } from '@fhem-native/directives';
import { ComponentLoaderService, EditorService, ImportExportService, SelectComponentService, StructureService, UndoRedoService } from '@fhem-native/services';

import { FhemComponentSettings } from '@fhem-native/types/components';
import { clone, decimalRounder, getUID } from '@fhem-native/utils';
import { APP_CONFIG } from '@fhem-native/app-config';

@UntilDestroy()
@Component({
	selector: 'fhem-native-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenuComponent implements OnInit{
	@Input() componentId!: string;
	@Input() source!: 'component'|'grid';
	@Input() transformationManager!: TransformationManagerDirective;

	componentConfigEditor$ = this.editor.getComponentConfigEditor();

	// relevant component
	canBeGrouped = false;
	canBeUnGrouped = false;
	
	constructor(
		public editor: EditorService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private popoverCtrl: PopoverController,
		private importExport: ImportExportService,
		private compLoader: ComponentLoaderService,
		private popoverController: PopoverController,
		public selectComponent: SelectComponentService,
		@Inject(DOCUMENT) private document: Document,
		@Inject(APP_CONFIG) private appConfig: any){
	}

	ngOnInit(): void {
		// check for groupings
		this.canBeGrouped = this.selectComponent.selectorList.size > 1;
		for(const key of this.selectComponent.selectorList.keys()){
			const component = this.structure.getComponent(key);
			if(!component || !(component && component.components)) continue;

			const hasNestedComponents = component.components.some(x=> x.components.length > 0);
			if(hasNestedComponents){
				this.canBeUnGrouped = true;
				break;
			}
		}

		// register listener to prevent context menu on backdrop
		fromEvent<PointerEvent>(this.document, "contextmenu").pipe( untilDestroyed(this) ).subscribe(e=> e.preventDefault());
	}

	/**
	 * Dismiss Informer
	 * Allow specialized handling of events from context menu creator
	 */
	private dismissInformer(eventName: string, customEvent?: string): void{
		this.popoverController.dismiss(eventName, customEvent || 'standard');
	}

	async createRoomModal(): Promise<void>{
		const popover = await this.popoverCtrl.create({
			component: AddRoomComponent,
			cssClass: 'add-room-popover',
			componentProps: { newRoom: true, room: this.structure.createRoom() }
		});

		await popover.present();
	}

	async createComponentDetailsModal(): Promise<void>{
		this.dismissInformer('showComponentDetails');

		const popover = await this.popoverCtrl.create({
			component: ComponentDetailsComponent,
			cssClass: 'component-details-popover',
			componentProps: { componentUID: this.componentId }
		});

		await popover.present();
	}

	createComponentModal(): void{
		this.editor.component.enterEditMode(this.transformationManager.containerId);
	}

	async editComponentModal(): Promise<void>{
		// get relevant component from view
		const component = this.structure.getComponent(this.componentId);
		if(!component) return this.dismissInformer('editComponent');

		// get unfolded config
		const componentSettings = await this.compLoader.unFlattenComponentConfig( component );

		// start editor
		this.editor.component.editComponent(componentSettings, this.transformationManager.containerId, this.componentId);

		this.dismissInformer('editComponent');
	}

	private updateZindex(item: TransformationItemDirective, updatedZindex: number): void{
		item.updateZIndex( updatedZindex.toString() );
		const roomComponent = this.structure.getComponent(item.id);
		if(roomComponent) roomComponent.position.zIndex = updatedZindex;
	}

	sendTo(param: string): void{
		const selectedComponentIds = Array.from(this.selectComponent.selectorList.keys());
		const unselectedItems = Array.from(this.transformationManager.transformationItems).filter( ([key, value])=> !selectedComponentIds.includes(key)).map(x=> x[1]);

		const sortedSelected = Array.from(this.selectComponent.selectorList.values()).sort( (a, b) => parseInt(a.hostEl.style.zIndex) - parseInt(b.hostEl.style.zIndex) );
		const sortedSelectedValues = sortedSelected.map(x=> parseInt(x.hostEl.style.zIndex));

		const sortedUnselected = unselectedItems.sort( (a, b) => parseInt(a.hostEl.style.zIndex) - parseInt(b.hostEl.style.zIndex) );
		const sortedunSelectedValues = sortedUnselected.map(x=> parseInt(x.hostEl.style.zIndex));

		if(param === 'back'){
			sortedSelected.forEach((item, i)=>{
				const currentZindex = parseInt(item.hostEl.style.zIndex);
				let updatedZindex = 1;
				if(i > 0){
					const prevZindex = parseInt(sortedSelected[i -1].hostEl.style.zIndex);
					updatedZindex = sortedSelectedValues[i -1] === currentZindex ? prevZindex : prevZindex + 1;
				}
				this.updateZindex(item, updatedZindex);
			});
			const maxSelected = Math.max(...sortedSelected.map(x=> parseInt(x.hostEl.style.zIndex)));

			unselectedItems.forEach((item, i)=>{
				const currentZindex = parseInt(item.hostEl.style.zIndex);
				let updatedZindex = maxSelected + 1;
				if(i > 0){
					const prevZindex = parseInt(sortedUnselected[i -1].hostEl.style.zIndex);
					updatedZindex = sortedunSelectedValues[i -1] === currentZindex ? prevZindex : prevZindex + 1;
				}
				this.updateZindex(item, updatedZindex);
			});
		}else{
			unselectedItems.forEach((item, i)=>{
				const currentZindex = parseInt(item.hostEl.style.zIndex);
				let updatedZindex = 1;
				if(i > 0){
					const prevZindex = parseInt(sortedUnselected[i -1].hostEl.style.zIndex);
					updatedZindex = sortedunSelectedValues[i -1] === currentZindex ? prevZindex : prevZindex + 1;
				}
				this.updateZindex(item, updatedZindex);
			});
			const maxUnselected = sortedUnselected.length ? Math.max(...sortedUnselected.map(x=> parseInt(x.hostEl.style.zIndex))) : 0;

			sortedSelected.forEach((item, i)=>{
				const currentZindex = parseInt(item.hostEl.style.zIndex);
				let updatedZindex = maxUnselected + 1;
				if(i > 0){
					const prevZindex = parseInt(sortedSelected[i -1].hostEl.style.zIndex);
					updatedZindex = sortedSelectedValues[i -1] === currentZindex ? prevZindex : prevZindex + 1;
				}
				this.updateZindex(item, updatedZindex);
			});
		}
		this.undoManager.addChange();
		this.dismissInformer('sendTo');
	}

	async groupComponents(): Promise<void>{
		// remove component creation/edit menu
		this.editor.component.leaveEditMode();

		const selectedComponentIds = Array.from(this.selectComponent.selectorList.keys());
		const unselectedItems = Array.from(this.transformationManager.transformationItems).filter( ([key, value])=> !selectedComponentIds.includes(key)).map(x=> x[1]);
		const maxZIndexUnselected = unselectedItems.length ? Math.max(...unselectedItems.map(x=> parseInt(x.hostEl.style.zIndex))) : 0;

		// get current container
		const parentContainer = this.structure.getComponentContainer(this.transformationManager.containerId);
		const containerRegistry = this.compLoader.getContainerRegistry(this.transformationManager.containerId);
		const currContainerPos = this.transformationManager.container.getBoundingClientRect();

		if(!parentContainer || !containerRegistry) return;
		// get blank component
		const compConfig = await this.compLoader.importFhemComponentConfig('GROUPER');
		const fhemComponentConfig = this.compLoader.getFhemComponentConfig(compConfig);
		if(!fhemComponentConfig.components) return;

		const positionData: DOMRect[] = [];
		const compConfigs: FhemComponentSettings[] = [];
		for(const [key, item] of this.selectComponent.selectorList){
			// get relevant component
			const component = this.structure.getComponent(key);
			if(!component) continue;
			compConfigs.push(component);

			// remove selected components from view
			const componentRegistry = this.compLoader.getComponentFromRegistry(component.UID);
			if(!componentRegistry) continue;

			// get current position
			const currPos = componentRegistry.component.location.nativeElement.firstChild.firstChild.getBoundingClientRect();
			positionData.push(currPos);

			// remove component from view
			this.compLoader.destroyComponent(componentRegistry);
			// delete component from rooms
			this.structure.deleteComponent(componentRegistry.containerId, component.UID);
		}
		// clear current selector list
		this.selectComponent.clearSelectorList();

		// get relevant position data of container
		const top = (Math.min(...positionData.map(x=> x.top)) - currContainerPos.top) + this.transformationManager.container.scrollTop;
		const left = Math.min(...positionData.map(x=> x.left)) - currContainerPos.left;
		const width = currContainerPos.width - ( left  + (currContainerPos.width - ( Math.max(...positionData.map(x=> x.left + x.width)) - currContainerPos.left ) ) );
		const height = currContainerPos.height - ( top + ( currContainerPos.height - (( Math.max(...positionData.map(x=> x.top + x.height)) - currContainerPos.top) + this.transformationManager.container.scrollTop) ) );
		
		// update position of new group container
		fhemComponentConfig.position.top = decimalRounder(( top / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
		fhemComponentConfig.position.left = decimalRounder(( left / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
		fhemComponentConfig.position.width = decimalRounder(( width / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
		fhemComponentConfig.position.height = decimalRounder(( height / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
		fhemComponentConfig.position.zIndex = maxZIndexUnselected + 1;

		// update positions of items in new container
		positionData.forEach((data, i)=>{
			compConfigs[i].position.top = decimalRounder(( (((data.top - currContainerPos.top) - top) + this.transformationManager.container.scrollTop) / height ) * 100, this.structure.getGridDecimal()) + '%';
			compConfigs[i].position.left = decimalRounder(( ((data.left - currContainerPos.left) - left) / width ) * 100, this.structure.getGridDecimal()) + '%';
			compConfigs[i].position.width = decimalRounder((data.width  / width) * 100, this.structure.getGridDecimal()) + '%';
			compConfigs[i].position.height = decimalRounder((data.height  / height) * 100, this.structure.getGridDecimal()) + '%';
		});

		// add comp configs to group
		fhemComponentConfig.components[0].components = compConfigs;

		// add new group component to structure
		this.structure.addComponent(parentContainer, fhemComponentConfig);
		// recreate components in new group
		this.compLoader.loadContainerComponents([fhemComponentConfig], containerRegistry);

		this.undoManager.addChange();
		this.dismissInformer('group');
	}

	unGroupComponents(): void{
		// remove component creation/edit menu
		this.editor.component.leaveEditMode();
		
		const parentContainer = this.structure.getComponentContainer(this.transformationManager.containerId);
		const containerRegistry = this.compLoader.getContainerRegistry(this.transformationManager.containerId);
		const currContainerPos = this.transformationManager.container.getBoundingClientRect();

		if(!parentContainer || !containerRegistry) return;

		for(const key of this.selectComponent.selectorList.keys()){
			// get relevant component
			const component = this.structure.getComponent(key);
			if(!component || !(component && component.components)) continue;

			// get all components of container
			const nestedComponents = this.structure.getAllComponents(component.components);
			const componentRegistryCollection = [];
			// remove deep nesting
			for(const nestedComponent of nestedComponents){
				// remove nested components
				if(nestedComponent.components) nestedComponent.components = [ this.compLoader.getBlankComponentContainer(nestedComponent.UID) ];

				const componentRegistry = this.compLoader.getComponentFromRegistry(nestedComponent.UID);
        		if(!componentRegistry) continue;

				// get current position
				const currPos = componentRegistry.component.location.nativeElement.firstChild.firstChild.getBoundingClientRect();

				// update positioning
				nestedComponent.position.top = decimalRounder(( ((currPos.top - currContainerPos.top) + this.transformationManager.container.scrollTop) / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
				nestedComponent.position.left = decimalRounder(( (currPos.left - currContainerPos.left) / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
				nestedComponent.position.width = decimalRounder(( currPos.width / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
				nestedComponent.position.height = decimalRounder(( currPos.height / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
				// save, to prevent destroy too early
				// would result in missing components from nested containers
				componentRegistryCollection.push(componentRegistry);
				
				this.structure.deleteComponent(componentRegistry.containerId, nestedComponent.UID);
				this.structure.addComponent(parentContainer, nestedComponent);
			}
			// remove group component, if needed
			if(component.name === 'Grouper'){
				const componentRegistry = this.compLoader.getComponentFromRegistry(component.UID);
				if(!componentRegistry) continue;

				componentRegistryCollection.push(componentRegistry);
				this.structure.deleteComponent(componentRegistry.containerId, component.UID);
			}
			// destroy old components
			componentRegistryCollection.forEach(x=> this.compLoader.destroyComponent(x));

			// recreate components on main container
			this.compLoader.loadContainerComponents(nestedComponents, containerRegistry);
		}
		// clear current selector list
		this.selectComponent.removeAllSelectors();
		this.selectComponent.clearSelectorList();

		this.undoManager.addChange();
		this.dismissInformer('unGroup');
	}

	selectSingleComponent(): void{
		this.dismissInformer('selectSingle', 'preventUnselect');
	}

	selectAllComponents(): void{
		this.transformationManager.transformationItems.forEach((item)=> this.selectComponent.buildSelector(item));
	}

	copyComponents(): void{
		this.selectComponent.copyComponents();
	}

	pasteComponents(): void {
		if( this.selectComponent.pasteComponents(this.transformationManager.containerId) ) this.undoManager.addChange();
		this.dismissInformer('paste');
	}

	deleteComponents(): void{
		this.selectComponent.deleteComponents();

		this.undoManager.addChange();
		this.dismissInformer('delete');

		// check if component editor is still relevant
		const currComponentEdit = this.editor.component.getCurrentMode().componentUID;
		if(!currComponentEdit) return;

		// component still found in current registry --> not deleted
		const componentRegistry = this.compLoader.getComponentFromRegistry(currComponentEdit);
		if(componentRegistry) return;

		this.editor.component.leaveEditMode();
	}

	async exportComponents(): Promise<void>{
		const componentSettings: FhemComponentSettings[] = [];

		for(const key of this.selectComponent.selectorList.keys()){
			// get relevant component
			const component = this.structure.getComponent(key);
			if(!component) continue;

			// clone, to prevent overwrite
			const compCopy = clone(component);
			// clone, to prevent overwrite
			if(compCopy.components){
				const nestedComponents = this.structure.getAllComponents(compCopy.components);
				for(let i = 0; i < nestedComponents.length; i++){
					nestedComponents[i] = await this.compLoader.getCompressedFhemComponentConfig(nestedComponents[i]);
				}
			}
			// compress main component
			const compressedSettings = await this.compLoader.getCompressedFhemComponentConfig(compCopy);
			componentSettings.push(compressedSettings);
		}

		if(componentSettings.length > 0) this.importExport.exportComponents(componentSettings);
		this.dismissInformer('export');
	}

	async importComponents(): Promise<void>{
		const componentSettings = await this.importExport.importComponents();
		if(!componentSettings) return;

		const parentContainer = this.structure.getComponentContainer(this.transformationManager.containerId);
		const containerRegistry = this.compLoader.getContainerRegistry(this.transformationManager.containerId);
		if(!parentContainer || !containerRegistry) return;

		// get z index to dispay on top
		const maxZindex = parentContainer.length ? Math.max(...parentContainer.map(x=> x.position.zIndex)) : 1;

		for(const component of componentSettings){
			component.UID = getUID();
			component.position.zIndex = maxZindex + 1;

			this.structure.addComponent(parentContainer, component);
		}

		this.compLoader.loadContainerComponents(componentSettings, containerRegistry);
		this.undoManager.addChange();
	}
}