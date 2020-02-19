import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
// Services
import { StructureService } from './structure.service';
import { HelperService } from './helper.service';
import { CreateComponentService } from './create-component.service';

@Injectable({
	providedIn: 'root'
})

export class SelectComponentService {
	private renderer: Renderer2;

	// list of selected components
	public selectorList: Array<any> = [];
	// list of copy components
	// gets filled from editComponent
	public copyList: Array<any> = [];

	constructor(
		private structure: StructureService,
		private helper: HelperService,
		private createComponent: CreateComponentService,
		private rendererFactory: RendererFactory2){
		// create renderer in service
		this.renderer = rendererFactory.createRenderer(null, null);
	}

	// receives full element properties
	private addSelector(el, container){
		if(!this.selectorList.find(x => x.ID === el.ID)){
			el = JSON.parse(JSON.stringify(el));
			if(!el.pinned){
				el['selectorContainer'] = container;
				this.selectorList.push(el);
			}
		}
	}

	// receives only ID to remove
	private removeSelector(ID){
		if(this.selectorList.findIndex(x=> x.ID === ID) > -1){
			this.selectorList.splice(this.selectorList.findIndex(x=> x.ID === ID), 1);
		}
	}

	// build the copy selector
	// unselect selected elements if needed
	public buildCopySelector(ID: string, unselect: boolean, container: any){
		const roomElements = this.structure.getComponentContainer(container);
		const selected = roomElements.find(x=> x.ID === ID);
		if(selected){
			const el = document.getElementById(selected.ID);
			if(!el.classList.contains('pinned')){
				if(el.classList.contains('selected-for-copy')){
					if(unselect){
						this.renderer.removeClass(el, 'selected-for-copy');
						this.removeSelector(ID);
					}
				}else{
					this.renderer.addClass(el, 'selected-for-copy');
					this.addSelector(selected, container);
				}
			}
		}
		this.removeContainerCopySelector(container, false);
	}

	// build the copy selector for all components in one container
	public buildCopySelectorAll(container){
		const roomElements = this.structure.getComponentContainer(container);
		roomElements.forEach((el)=>{
			this.buildCopySelector(el.ID, false, container);
		});
		this.removeContainerCopySelector(container, false);
	}

	// remove the selector in any container
	public removeCopySelector(ID){
		const el = document.getElementById(ID);
		this.renderer.removeClass(el, 'selected-for-copy');
		this.removeSelector(ID);
	}

	// removes the copy selectors from all other containers
	// enables fast changes between different containers
	// defines if all should be removed or just the ones outside the container
	// container must not be defined for all removal
	public removeContainerCopySelector(container, all: boolean){
		const containerComponents = container ? this.structure.getComponentContainer(container) : false;
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

	public reconstructCopySelectorList(){
		setTimeout(()=>{
			this.selectorList.forEach((selector)=>{
				if(this.structure.getComponent(selector.ID) === null){
					this.selectorList = [];
				}else{
					this.buildCopySelector(selector.ID, false, selector.selectorContainer);
				}
			});
		}, 0);
	}

	// evaluate if component has selector
	public evalCopySelector(ID: string){
		const element = document.getElementById(ID);
		return element.classList.contains('selected-for-copy') ? true : false;
	}

	// evaluate all components in container
	public evalCopySelectorAll(container){
		const containerComponents = this.structure.getComponentContainer(container);
		let allSelected: boolean = true;

		for(const comp of containerComponents){
			if(!this.evalCopySelector(comp.ID)){
				allSelected = false;
				break;
			}
		}
		return allSelected;
	}

	// copy a component
	public copyComponent(ID, container){
		// clear the copy List
		this.copyList = [];
		// build copy selector for selected elem
		// if id is passed
		// shortcuts don´t pass id
		if(ID){
			this.buildCopySelector(ID, false, container);
		}
		// build copy without constructor
		const temp = [];
		this.selectorList.forEach((item)=>{
			// this.selectComponent.selectorList
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
	public pasteComponent(container){
		// get room components
		const roomComponents = this.structure.getComponentContainer(container);
		// get the selected elements from selector service
		const copyList = JSON.parse(JSON.stringify(this.copyList));
		// build new ID for every nested component
		this.structure.modifyComponentList(copyList, (copy)=>{
			copy.ID = this.helper.UIDgenerator();
		});

		copyList.forEach((copy)=>{
			// setting new position to 20 px below current position
			// position elements in swiper and popup on top, to find them
			copy.position.top = container.element.nativeElement.parentNode.id.match(/(popup|swiper)/) ? 0 : parseInt(copy.position.top)+ 20 + 'px';
			copy.position.left = container.element.nativeElement.parentNode.id.match(/(popup|swiper)/) ? 0 : parseInt(copy.position.left) + 'px';

			roomComponents.push(copy);
			this.createComponent.loadRoomComponents([copy], container, false);
			// timeout fix for component availability
			setTimeout(()=>{
				this.buildCopySelector(copy.ID, false, container);
			}, 0);
		});
	}

	// remove the relevant components to container
	public removeComponent(component, container){
		// get room components
		const roomComponents = this.structure.getComponentContainer(container);
		const removeList = [];
		
		roomComponents.forEach((el)=>{
			if(this.evalCopySelector(el.ID)){
				removeList.push(JSON.parse(JSON.stringify(el)));
			}
		});
		// check if selected component is the only one in container
		if(component && removeList.length === 0){
			removeList.push(JSON.parse(JSON.stringify(component)));
		}
		// remove the selected elements
		removeList.forEach((el)=>{
			this.createComponent.removeFhemComponent(el.ID);
			this.removeCopySelector(el.ID);
			roomComponents.splice(
				this.helper.find(roomComponents, 'ID', el.ID).index, 1
			);
		});
		this.removeGroups(removeList);
	}

	// remove unused groups on delete
	private removeGroups(removeList: Array<any>){
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

	// eval grouped components
	// determine grouped components, component is in other groups
	public isGrouped(ID){
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
}