import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';

// interfaces
import { DynamicComponentDefinition } from '../interfaces/interfaces.type';

// Services
import { StructureService } from './structure.service';
import { ComponentLoaderService } from './component-loader.service';

interface Handle { ID: string, callback: any }
interface HandleUpdate { ID: string, forHandle: string, dimensions: any }

@Injectable({
	providedIn: 'root'
})

export class SelectComponentService {
	// renderer reference
	private renderer: Renderer2;

	// list of selected components
	public selectorList: Array<DynamicComponentDefinition> = [];
	// list of copy components
	public copyList: Array<DynamicComponentDefinition> = [];

	// handles for resize/move
	public handles = new Subject<HandleUpdate>();
	// item move handler
	private moveHandles: Array<{ID: string, callback: any}> = [];
	// item resize handler
	private resizeHandles: Array<{ID: string, callback: any}> = [];
	// item while resize handler
	private whileResizeHandles: Array<{ID: string, callback: any}> = [];

	constructor(
		private rendererFactory: RendererFactory2,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService){
		// create renderer in service
		this.renderer = rendererFactory.createRenderer(null, null);
		// subscription to Handles
		this.handles.subscribe((handleUpdate: HandleUpdate)=>{
			this[handleUpdate.forHandle + 'Handles'].forEach((handle: Handle)=>{
				if(handle.ID === handleUpdate.ID){
					handle.callback(handleUpdate.dimensions);
				}
				// trigger to all events
				if(handle.ID.match(/ALL/g)){
					handle.callback(handleUpdate.dimensions);
				}
			});
		});
	}

	// add handle event, because 
	public addHandle(ID: string, forHandle: string, callback: any): void{
		if(!this[forHandle + 'Handles'].find(x => x.ID === ID)){
			this[forHandle + 'Handles'].push({ID: ID, callback: callback});
		}
	}

	// remove handle event
	public removeHandle(ID: string, forHandle: string): void{
		const index = this[forHandle + 'Handles'].findIndex(x=> x.ID === ID);
		if(index > -1){
			this[forHandle + 'Handles'].splice(index, 1);
		}
	}

	// receives full element properties
	private addSelector(component: any): void{
		if(!this.selectorList.find(x => x.ID === component.ID)){
			this.selectorList.push(component);
		}
	}

	// receives only ID to remove
	private removeSelector(ID: string): void{
		if(this.selectorList.findIndex(x=> x.ID === ID) > -1){
			this.selectorList.splice(this.selectorList.findIndex(x=> x.ID === ID), 1);
		}
	}

	// evaluate if component has selector
	public evalCopySelector(ID: string): boolean{
		const element: HTMLElement = document.getElementById(ID);
		return element.classList.contains('selected-for-copy') ? true : false;
	}

	// evaluate all components in container for selector
	public evalCopySelectorAll(container: any): boolean{
		const containerComponents = this.structure.getComponentContainer(container);
		let allSelected: boolean = true;
		if(containerComponents && containerComponents.length > 0){
			for(const comp of containerComponents){
				if(!this.evalCopySelector(comp.ID)){
					allSelected = false;
					break;
				}
			}
		}else{
			// container is empty
			allSelected = false;
		}
		return allSelected;
	}

	// build the copy selector for all components in one container
	public buildCopySelectorAll(container: any): void{
		const roomElements = this.structure.getComponentContainer(container);
		roomElements.forEach((el)=>{
			this.buildCopySelector(el.ID, false);
		});
		this.removeContainerCopySelector(container, false);
	}

	// build the copy selector
	// unselect selected elements if needed
	// dirty allows selection, even if component is pinned
	public buildCopySelector(ID: string, unselect: boolean, dirty?: boolean): void{
		const el: HTMLElement = document.getElementById(ID);
		const component: any = this.structure.getComponent(ID);
		if(component && el){
			if(!el.classList.contains('pinned') || dirty){
				if(el.classList.contains('selected-for-copy')){
					if(unselect){
						this.renderer.removeClass(el, 'selected-for-copy');
						this.removeSelector(ID);
					}
				}else{
					this.renderer.addClass(el, 'selected-for-copy');
					this.addSelector(component);
				}
			}
		}
		this.removeContainerCopySelector(this.componentLoader.currentContainer, false);
	}

	// build copy selector for grouped components
	// dirty allows selection, even if component is pinned
	public buildCopySelectorForRelevant(ID: string, unselect?: boolean, dirty?: boolean): void{
		if(this.isGrouped(ID)){
			let componentGroups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
			if(componentGroups){
				for(const [key, value] of Object.entries(componentGroups)){
					if(value){
						const group: string[] = value;
						if(value.includes(ID)){
							group.forEach((componentID: string)=>{
								if(unselect){
									// fallback to not unselect and select at the same time 
									// due to same components in different groups
									this.removeCopySelector(componentID);
								}else{
									this.buildCopySelector(componentID, false, dirty);
								}
							});
						}
					}
				}
			}
		}
		else{
			// component is not grouped
			// just build copy selector
			this.buildCopySelector(ID, unselect || false, dirty);
		}
	}

	// copy a component
	public copyComponent(ID: string, container: any): void{
		// clear the copy List
		this.copyList = [];
		// build copy selector for selected elem
		// if id is passed
		// shortcuts don´t pass id
		if(ID !== ''){
			this.buildCopySelector(ID, false);
		}
		// build copy without constructor
		const temp = [];
		this.selectorList.forEach((item)=>{
			let obj = {};
			for (const [key, value] of Object.entries(item)) {
				if(key !== 'selectorContainer'){
					obj[key] = value;
				}
			}
			temp.push(obj);
		});
		// create deep copy of list
		this.copyList = JSON.parse(JSON.stringify(temp));
	}

	// paste the relevant components to container
	public pasteComponent(container: any): void{
		// get room components
		const roomComponents = this.structure.getComponentContainer(container);
		// get the selected elements from selector service
		const copyList = JSON.parse(JSON.stringify(this.copyList));
		// detect grouping
		let isGrouped: any = this.isGroupedAny(copyList);
		// get the group reference
		const group: string[] = isGrouped ? this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group] : [];
		// placeholder for new group of copied components
		let newGroup: Array<any> = [];

		// build new ID for every nested component
		this.structure.modifyComponentList(copyList, (copy)=>{
			// detect grouping in copy
			if(group.includes(copy.ID)){
				copy.ID = '_' + Math.random().toString(36).substr(2, 9);
				newGroup.push(copy);
			}else{
				// component is not in a group
				copy.ID = '_' + Math.random().toString(36).substr(2, 9);
			}
		});

		copyList.forEach((copy: any)=>{
			// get the container of the component
			// position elements 20px below
			copy.position.top = parseInt(copy.position.top) + 20 + 'px';

			// add new component to room
			roomComponents.push(copy);
			// load the new component
			this.componentLoader.loadRoomComponents([copy], container, false).then(()=>{
				// assign selector to new component
				setTimeout(()=>{
					this.buildCopySelector(copy.ID, false);
				});
			});
		});

		// apply grouping if needed
		if(newGroup.length > 1){
			this.groupComponents('', newGroup);
		}
	}

	// remove the relevant components to container
	public removeComponent(ID: string): void{
		// get room components
		const roomComponents = this.structure.getComponentContainer(this.componentLoader.currentContainer);
		const removeList = [];

		if(ID !== ''){
			this.buildCopySelector(ID, false);
		}
		this.selectorList.forEach((component)=>{
			removeList.push(JSON.parse(JSON.stringify(component)));
		});
		// remove the selected elements
		removeList.forEach((component)=>{
			// find component in container
			const index = roomComponents.findIndex(x => x.ID === component.ID);
			if(index > -1){
				this.componentLoader.removeDynamicComponent(component.ID);
				this.removeCopySelector(component.ID);
				roomComponents.splice(index, 1);
			}
		});
		this.removeGroups(removeList);
	}

	// group components
	// custom list is used, to build group for specific list
	public groupComponents(componentID: string, customList?: Array<any>): void{
		const isGrouped = this.isGroupedAny();
		if(isGrouped && componentID !== ''){
			// ungroup
			// remove selection from group
			// except the current component
			this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group].forEach((componentID: string)=>{
				if(componentID !== componentID){
					this.removeCopySelector(componentID);
				}
			});
			// delete the group
			delete this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group];
		}else{
			// group
			// check if groups exist and create the container
			if(!this.structure.rooms[this.structure.currentRoom.ID]['groupComponents']){
				this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'] = {};
			}
			const groups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
			const lastKey = Object.keys(groups)[ Object.keys(groups).length - 1 ];
			// if groups are given, select last group integer + 1
			groups['group' +( lastKey ? ( parseInt(lastKey.match(/\d+/g)[0]) + 1 ) : 1 ) ] = (customList || this.selectorList).map(x=> x.ID);
		}
	}

	// remove unused groups on delete
	private removeGroups(removeList: Array<any>): void{
		// check if component is in group
		let componentGroups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
		if(componentGroups){
			for(const [key, value] of Object.entries(componentGroups)){
				if(value){
					const group: any = value;
					removeList.forEach((comp)=>{
						if(group.includes(comp.ID)){
							componentGroups[key].splice(group.indexOf(comp.ID), 1);
						}
					});
					// check if group is now 1/empty and remove it
					if(group.length <= 1){
						delete this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][key];
					}
				}
			}
		}
	}

	// remove the selector in any container
	public removeCopySelector(ID: string): void{
		const el: HTMLElement = document.getElementById(ID);
		this.renderer.removeClass(el, 'selected-for-copy');
		this.removeSelector(ID);
	}

	// removes the copy selectors from all other containers
	// enables fast changes between different containers
	// defines if all should be removed or just the ones outside the container
	// container must not be defined for all removal
	public removeContainerCopySelector(container: any, all: boolean): void{
		const containerComponents = container ? this.structure.getComponentContainer(container) : false;
		// build selector list to untouch selector array first
		const selectorList = Array.from(document.querySelectorAll('.selected-for-copy'), x=> x.id);

		selectorList.forEach((selector)=>{
			if(all){
				this.removeCopySelector(selector);
			}else{
				if(containerComponents && !containerComponents.find(x=>x.ID === selector)){
					this.removeCopySelector(selector);
				}
			}
		});
	}

	// eval grouped components
	// determine grouped components, component is in other groups
	public isGrouped(ID: string): any{
		let result: any = false;
		let componentGroups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
		if(componentGroups){
			for(const [key, value] of Object.entries(componentGroups)){
				if(value){
					const group:any = value;
					for(let i = 0; i < group.length; i++){
						if(group[i] === ID){
							result = {
								group: key,
								item: i
							};
							break;
						}
					}
				}
				if(result){
					break;
				}
			}
		}
		return result;
	}

	// detect if any of the selected components is grouped
	// can receive Array as well --> detect grouping in copys
	public isGroupedAny(arr?: Array<any>): any{
		let result: any = false;
		for(const selector of arr || this.selectorList){
			let group = this.isGrouped(selector.ID);
			if(group){
				result = group;
				break;
			}
		}
		return result;
	}
}