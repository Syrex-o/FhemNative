import { Injectable } from '@angular/core';

import { TransformationItemDirective } from '@fhem-native/directives';

import { StructureService } from './structure.service';
import { ComponentLoaderService } from './component-loader.service';

import { FhemComponentSettings } from '@fhem-native/types/components';

import { clone, getUID } from '@fhem-native/utils';

@Injectable({providedIn: 'root'})
export class SelectComponentService {
    public selectorList = new Map<string, TransformationItemDirective>();
    public copyList: FhemComponentSettings[] = [];

    constructor(
        private structure: StructureService,
        private compLoader: ComponentLoaderService){
    }

    /**
     * Add selection flag to item
     * @param item 
     */
    public buildSelector(item: TransformationItemDirective): void{
        if(item.transformationRect){
            item.selected = true;
            item.transformationRect.classList.add('selected');
            // update list
            this.selectorList.set(item.id, item);
        }
    }

    /**
     * Remove selection flag to item
     * @param item 
     */
    public removeSelector(item: TransformationItemDirective): void{
        if(item.transformationRect){
            item.selected = false;
            item.transformationRect.classList.remove('selected');
            // update list
            this.selectorList.delete(item.id);
        }
    }

    /**
     * Remove all acitve selectors
     */
    public removeAllSelectors(): void{
        this.selectorList.forEach(item=> this.removeSelector(item));
    }

    public clearCopyList(): void{
        this.copyList = [];
    }

    public clearSelectorList(): void{
        this.selectorList.clear();
    }

    /**
     * Copy List of selected components
     */
    copyComponents(): void{
        const copyList: FhemComponentSettings[] = [];

        for(const key of this.selectorList.keys()){
            const component = this.structure.getComponent(key);
            if(!component) continue;
            copyList.push(component);
        }
        this.copyList = clone(copyList);
    }

    /**
     * Paste components in relevant container
     * @param containerId 
     */
    pasteComponents(containerId: string): boolean{
        let pastedComponents = false;

        const parentContainer = this.structure.getComponentContainer(containerId);
		const containerRegistry = this.compLoader.getContainerRegistry(containerId);
		if(!parentContainer || !containerRegistry) return false;

		this.copyList.forEach((listItem)=>{
			// assign new id
			listItem.UID = getUID();

			// adjust top value
			listItem.position.top = parseInt(listItem.position.top) + 2 + '%';

			// add component to structure
			this.structure.addComponent(parentContainer, listItem);
		});
        if(this.copyList.length) pastedComponents = true;
		this.compLoader.loadContainerComponents(this.copyList, containerRegistry);

		this.clearCopyList();
        this.removeAllSelectors();

        return pastedComponents;
    }

    deleteComponents(): boolean{
        const deletedComponents = this.selectorList.size > 0;

        for(const key of this.selectorList.keys()){
            // get relevant component
			const component = this.structure.getComponent(key);
			if(!component) continue;

            // remove selected components from view
			const componentRegistry = this.compLoader.getComponentFromRegistry(component.UID);
			if(!componentRegistry) continue;

            // remove component from view
			this.compLoader.destroyComponent(componentRegistry);

            // delete component from rooms
			this.structure.deleteComponent(componentRegistry.containerId, component.UID);
        }
        // clear current selector list
		this.removeAllSelectors();
		this.clearSelectorList();

        return deletedComponents;
    }
}