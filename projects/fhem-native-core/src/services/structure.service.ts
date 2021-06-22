import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';

// Interfaces
import { Room, RoomParams, ComponentPosition, DynamicComponentDefinition, ComponentInStructure } from '../interfaces/interfaces.type';

@Injectable({
	providedIn: 'root'
})

export class StructureService {
	// list of all rooms
	// will be generated on start
	public rooms: Room[]= [];
	// list of structured rooms
	public structuredRooms: Room[] = [];
	// list of room defauls
	// will be loaded on initial load
	private roomDefaults: Room[] = [{ID: 0, name: 'Home', icon: 'home', UID: '_s01tz3k9x', components: []}];
	// reserved storage of the current room for refereces
	// filled on room entrance
	public currentRoom!: Room;

	constructor(
		private zone: NgZone,
		private router: Router, 
		private storage: StorageService, 
		private settings: SettingsService){}

	// get the current room
	public getCurrentRoom(ID: any): void{
		const foundRoom: Room|undefined = this.rooms.find(x=> x.ID.toString() === ID.toString());
		if(foundRoom){
			this.currentRoom = foundRoom;
		}
	}

	// navigate rooms
	public navigateToRoom(name: string, ID: number, params?: RoomParams): void{
		this.router.navigate(['/room', name + '_' + ID], { 
			replaceUrl: true,
			queryParams: params 
		});
	}

	// load rooms from storage
	public loadRooms(navigate?: boolean, component?: any, reload?: boolean): Promise<boolean>{
		return new Promise((resolve)=>{
			this.zone.run(()=>{
				this.storage.setAndGetSetting({name: 'rooms', default: JSON.stringify(this.roomDefaults)}).then((result: Room[])=>{
					// generate Unique ID for rooms, if not defined
					let allUID: boolean = true;
					result.forEach((room: Room)=>{
						if(!room.UID){
							allUID = false;
							room.UID = this.settings.getUID();
						}
					});
					// save rooms, when new ID´s are generated
					if(!allUID) this.storage.changeSetting({name: 'rooms', change: JSON.stringify(result)});
					this.rooms = result;
					// load routes only after rooms are loaded from storage
					if(component) this.router.resetConfig([{path: 'room/:id', component: component}]);
					// navigate to room
					if(navigate){
						const firstRoom: Room = this.rooms[0];
						const params: RoomParams = {name: firstRoom.name, ID: firstRoom.ID, UID: firstRoom.UID, reload: (reload || false)};
						this.navigateToRoom(this.rooms[0].name, this.rooms[0].ID, params);
					}
					this.getStructuredRoomList();
					resolve(true);
				});
			});
		});
	}

	// saving room configuraion
	public saveRooms(): Promise<Room[]> {
		return new Promise((resolve) => {
			// remove not needed stuff from components, to reduce room storage
			let allComponents: any = this.getAllComponents();
			allComponents.forEach((componentDefinition: {component: any, room: string, roomID: string})=>{
				let component = componentDefinition.component;
				// delete parts that where added from component loader
				// no need to save them. Will be generated from config
				component = this.removeNotNeededComponentParts(component);
			});
			// shared config handling is done by unde-redo-handler (avoid circular dependency and device specific saves)
			// save rooms
			this.storage.changeSetting({ name: 'rooms', change: JSON.stringify(this.rooms) }).then((res: Room[]) => {
				this.rooms = res;
				this.getCurrentRoom(this.currentRoom.ID);
				this.getStructuredRoomList();
				resolve(res);
			});
		});
	}

	// remove not needed stuff from components --> right before save/export
	public removeNotNeededComponentParts(component: DynamicComponentDefinition): DynamicComponentDefinition{
		if(component.dependencies){
			delete component.dependencies;
		}
		if(component.dimensions){
			delete component.dimensions;
		}
		if(component.type){
			delete component.type;
		}
		if(component.dependencies){
			delete component.dependencies;
		}
		if(component.createScaler){
			delete component.createScaler;
		}
		if('container' in component){
			delete component.container;
		}

		return component;
	}

	// get minified component
	// compare component to default and remove duplicates that can be restored from component definition
	public getMinifiedComponent(component: DynamicComponentDefinition, componentDefault: DynamicComponentDefinition): DynamicComponentDefinition{
		let transformer = (val: any)=>{
			return Array.isArray(val) ? JSON.stringify(val) : val;
		}
		const componentDefaults: DynamicComponentDefinition = componentDefault;
		const defaultAttributes: any = componentDefaults.attributes;
		const compAttributes: any = component.attributes;
		// loop the default component
		for(const key of Object.keys(componentDefaults.attributes)){
			defaultAttributes[key].forEach((value: any)=>{
				// look for identical values
				// check for new attributes
				// new attribute in App can cause crash from shared config
				if(Object.keys(compAttributes).length > 0 && compAttributes[key]){
					// get relevant
					let ind = compAttributes[key].findIndex((x: any)=> x.attr === value.attr && transformer(x.value) === transformer(value.value));
					if(ind > -1){
						compAttributes[key].splice(ind, 1);
					}
					if(Object.keys(compAttributes[key]).length === 0){
						delete compAttributes[key];
					}
				}
			});
		}
		return component;
	}

	// returning the list of rooms structured into submenus
	public getStructuredRoomList(): void{
		let structuredRooms: Room[] = JSON.parse(JSON.stringify(this.rooms));
		this.rooms.forEach((room: Room, i: number)=>{
			if(room.groupRooms){
				room.groupRooms.forEach((groupRoom, j: number)=>{
					const foundIndex: number = structuredRooms.findIndex(x=> x.ID === groupRoom.ID);
					if(foundIndex > -1){
						structuredRooms.splice(foundIndex, 1);
					}else{
						let relevantRoom: Room = this.rooms[i];
						if(room.groupRooms && relevantRoom.groupRooms){
							room.groupRooms.splice(j, 1);
							relevantRoom.groupRooms.splice(j, 1);
						}
					}
				});
			}
		});
		this.structuredRooms = structuredRooms;
	}

	// pushing rooms back to normal structure and removing unused rooms
	public modifyRooms(): void{
		let modifiedRooms: Room[] = [];
		this.structuredRooms.forEach((room: Room, i: number)=>{
			if(room.useRoomAsGroup){
				let found = this.rooms.find(x=> x.ID === room.ID);
				if(found){
					modifiedRooms.push(room);
					modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
				}
				if(room.groupRooms){
					room.groupRooms = room.groupRooms.filter(groupRoom=> this.rooms.some(room=> groupRoom.ID === room.ID));
					room.groupRooms.forEach((group)=>{
						let found: Room|undefined = this.rooms.find(x=> x.ID === group.ID);
						found = JSON.parse(JSON.stringify(found));
						if(found){
							modifiedRooms.push(found);
							modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
							group.ID = found.ID;
						}
					});
				}
			}else{
				let found = this.rooms.find(x=> x.ID === room.ID);
				if(found){
					modifiedRooms.push(room);
					modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
				}
			}
		});
		this.rooms = modifiedRooms;
		this.getStructuredRoomList();
	}

	// return a Array of all components
	// includes {component: comp, room: roomName}
	// custom obj can be passed --> get components from a previous state
	public getAllComponents(): ComponentInStructure[]{
		let components: ComponentInStructure[] = [];
		// looper for nested components
		let looper = (arr: Array<any>, roomName: string, roomID: any)=>{
			for(let item of arr){
				if(item.ID){
					components.push({
						component: item,
						room: roomName,
						roomID: roomID
					});
				}
				// look for nested components
				if(item.attributes.components){
					// search in component containers
					if(item.attributes.components[0] && item.attributes.components[0].components){
						for(let subItem of item.attributes.components){
							looper(subItem.components, roomName, roomID);
						}
					}else{
						if(item.attributes.components){
							// search in single container component
							looper(item.attributes.components, roomName, roomID);
						}
					}
				}
			}
		}
		for(let item of this.rooms){
			looper(item.components, item.name, item.UID);
		}
		return components;
	}

	// exec callback on each nested component inside arr
	// searches for deep components
	public modifyComponentList(arr: Array<any>, callback: any): void{
		for(let item of arr){
			if(item.ID){
				callback(item);
			}
			if(item.attributes.components){
				// multi container
				if(item.attributes.components[0] && item.attributes.components[0].components){
					for(let subItem of item.attributes.components){
						this.modifyComponentList(subItem.components, callback);
					}
				}else{
					// single container
					this.modifyComponentList(item.attributes.components, callback);
				}
			}
		}
	}

	// get a specifiv component
	public getComponent(ID: string): DynamicComponentDefinition|null{
		const comp: any = this.searchForComp(this.rooms, ID);
		if(comp){
			return comp;
		}
		return null;
	}

	// get the container in rooms, that should be used for component creation
	public getComponentContainer(container: any): Array<DynamicComponentDefinition>|null{
		// check if a container as ref or the HTML element is passed --> extract ID
		const containerID: any = container.element ? container.element.nativeElement.parentNode.id : container.id;
		// container are defined ..._@ID (exp. room_@0, popup_@0123)
		// multi container components have special syntax containerID_component_@ID (exp. 1_swiper_@123)
		let relevantID = /_@(.*)/.exec(containerID);
		if(relevantID != null){
			let comp = this.searchForComp(this.rooms, relevantID[1]);
			if(comp){
				if(comp.attributes){
					if(comp.attributes.components[0] && comp.attributes.components[0].components){
						// multi container --> match first digits until underscore
						let multiContainerID = containerID.match(/\d+_/);
						if(multiContainerID){
							multiContainerID = parseInt(multiContainerID[0].replace('_', ''));
							return comp.attributes.components[multiContainerID] ? comp.attributes.components[multiContainerID].components : [];
						}

					}else{
						// single container
						return comp.attributes.components;
					}
				}else{
					// return room components
					return comp.components;
				}
			}
		}
		return null;
	}

	// searches for component in defined Array
	public searchForComp(arr: Array<any>, ID: string): any{
		for(let item of arr){
			// item found in top structure
			if(item.ID !== undefined && ID !== undefined && item.ID.toString() === ID.toString()){
				// return just item --> no parent available
				return item;
			}else{
				if(item.attributes){
					if(item.attributes.components !== undefined){
						// search in component containers
						if(item.attributes.components[0] && item.attributes.components[0].components){
							// search in multi container component
							for(let subItem of item.attributes.components){
								let check = this.searchForComp(subItem.components, ID);
								if(check){
									return check;
								}
							}
						}else{
							if(item.attributes.components !== undefined){
								// search in single container component
								let check = this.searchForComp(item.attributes.components, ID);
								if(check){
									return check;
								}
							}
						}
					}
				}else{
					// room structure got passed
					let check = this.searchForComp(item.components, ID);
					if(check){
						return check;
					}
				}
			}
		}
		return null;
	}

	// determine if the component is editable
	// rectangle is created in edit mode
	public canEditComponent(ID: string): boolean{
		const container = this.searchForComp(this.rooms, this.settings.modes.roomEditFrom);
		if(container){
			let canEdit = this.searchForComp( (container.attributes ? container.attributes.components : container.components), ID );
			if(canEdit){
				return true;
			}
		}
		return false;
	}

	// determine if the container is editable
	// grid is created on true in edit mode
	public canEditContainer(ID: any): boolean{
		const container = this.searchForComp(this.rooms, ID);
		if(container && container.ID === this.settings.modes.roomEditFrom){
			return true;
		}
		return false;
	}

	// number rounder helper
	private numberRounder(num: number, digits: number, base?: number): number{
		let pow: number = Math.pow(base||10, digits);
		return Math.round(num * pow) / pow;
	}

	// get position of component in percentage points
	// calulate percentage position from pixel position
	public getComponentPositionPercentage(component: DynamicComponentDefinition): ComponentPosition {
		// console.log(component);
		return {
			top: (component.position ? this.numberRounder((parseFloat(component.position.top) / window.innerHeight) * 100, 4) : 0) + '%',
			left: (component.position ? this.numberRounder((parseFloat(component.position.left) / window.innerWidth) * 100, 4) : 0) + '%',
			width: (component.position ? this.numberRounder((parseFloat(component.position.width) / window.innerWidth) * 100, 4) : 0) + '%',
			height: (component.position ? this.numberRounder((parseFloat(component.position.height) / window.innerHeight) * 100, 4) : 0) + '%',
			zIndex: component.position ? component.position.zIndex : 0,
			rotation: component.position ? component.position.rotation : '0deg'
		}
	}

	// get position of component in pixel points
	// calulate pixel position from percentage position
	public getComponentPositionPixel(component: DynamicComponentDefinition): ComponentPosition {
		return {
			top: (component.position_P ? this.roundToGrid(this.numberRounder(window.innerHeight * (parseFloat(component.position_P.top) / 100), 2)) : 0) + 'px',
			left: (component.position_P ? this.roundToGrid(this.numberRounder(window.innerWidth * (parseFloat(component.position_P.left) / 100), 2)) : 0) + 'px',
			width: (component.position_P ? this.roundToGrid(this.numberRounder(window.innerWidth * (parseFloat(component.position_P.width) / 100), 2)) : 0) + 'px',
			height: (component.position_P ? this.roundToGrid(this.numberRounder(window.innerHeight * (parseFloat(component.position_P.height) / 100), 2)) : 0) + 'px',
			zIndex: component.position_P ? component.position_P.zIndex : 0,
			rotation: component.position_P ? component.position_P.rotation : '0deg'
		}
	}

	// round pixel position to grid
	public roundToGrid(p: number): number {
		const n: number = this.settings.app.grid.gridSize;
		return (this.settings.app.grid.enabled ? (p % n < n / 2 ? p - (p % n) : p + n - (p % n)) : p );
	}

	// get mouse position
	public getMousePosition(e: any): {x: number, y: number} {
		return {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
	}

	// get mouse delta
	public getMouseDelta(start: {x: number, y: number}, e: any): {x: number, y: number} {
		const current: {x: number, y: number} = this.getMousePosition(e);
		return {
			x: current.x - start.x,
			y: current.y - start.y
		}
	}

	// get offsets of host element
	public getOffsets(hostEl: any): {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} {
		const c: HTMLElement = hostEl.parentElement.parentElement.parentElement;
		const container: DOMRect = c.getBoundingClientRect();
		const offsets = {
			top: container.top,
			left: container.left,
			right: window.innerWidth - (container.left + container.width),
			scroller: c.scrollTop
		};

		return {
			container: c,
			offsets: offsets
		}
	}

	// used to save the changed item position of a component
	// needs object of {item: 'position attributes of the item', dimenstions: 'dimensions that should be changed'}
	// will evaluate the available dimensions
	public saveItemPosition(obj: any, save: boolean) : void{
		for (const [key, value] of Object.entries(obj.dimensions)) {
			if (value !== undefined) {
				obj.item[key] = value + (key === 'rotation' ? 'deg' : 'px');
			}
		}
		// saving rooms after changing if needed
		if(save){
			this.saveRooms();
		}
	}
}