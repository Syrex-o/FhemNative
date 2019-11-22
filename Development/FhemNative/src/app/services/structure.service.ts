import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { StorageService } from './storage.service';
import { HelperService } from './helper.service';
import { SettingsService } from './settings.service';

@Injectable({
	providedIn: 'root'
})

export class StructureService {
	constructor(
		private router: Router,
		private storage: StorageService,
		private helper: HelperService,
		private settings: SettingsService,
		private zone: NgZone) {

	}
	// list of fhem components
	// gets filled on load to prevent circular dependencies
	public fhemComponents;

	// list of all rooms
	// will be generated on start
	public rooms: Array<any> = [];

	// list of structured rooms
	public structuredRooms: Array<any> = [];

	// list of room defauls
	// will be loaded on initial load
	private roomDefaults: Array<any> = [{
		ID: 0,
		name: 'Home',
		icon: 'home',
		components: []
	}];

	// selected room for editing
	public selectedRoom :any;

	// reserved storage of the current room for refereces
	// filled on room entrance
	public currentRoom: any;

	// getting the room name
	public getCurrentRoom() {
		return this.helper.find(this.rooms, 'ID', parseInt(this.router.url.match(/(\d+)$/g)[0]));
	}

	// returning the list of rooms structured into submenus
	public getStructuredRoomList(){
		let structuredRooms = JSON.parse(JSON.stringify(this.rooms));
		this.rooms.forEach((room, i)=>{
			if(room.groupRooms){
				room.groupRooms.forEach((groupRoom, j)=>{
					const found = this.helper.find(structuredRooms, 'ID', groupRoom.ID);
					if(found){
						structuredRooms.splice(found.index, 1);
					}else{
						room.groupRooms.splice(j, 1);
						this.rooms[i].groupRooms.splice(j, 1);
					}
				});
			}
		});
		this.structuredRooms = structuredRooms;
	}

	// pushing rooms back to normal structure and removing unused rooms
	public modifyRooms(){
		let modifiedRooms = [];
		this.structuredRooms.forEach((room, i)=>{
			if(room.useRoomAsGroup){
				let found = this.helper.find(this.rooms, 'ID', room.ID);
				if(found){
					modifiedRooms.push(room);
					modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
				}
				room.groupRooms = room.groupRooms.filter(groupRoom=> this.rooms.some(room=> groupRoom.ID === room.ID));
				room.groupRooms.forEach((group)=>{
					let found = this.helper.find(this.rooms, 'ID', group.ID);
					if(found){
						found = JSON.parse(JSON.stringify(found));
						modifiedRooms.push(found.item);
						modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
						group.ID = found.item.ID;
					}
				});
			}else{
				let found = this.helper.find(this.rooms, 'ID', room.ID);
				if(found){
					modifiedRooms.push(room);
					modifiedRooms[modifiedRooms.length - 1].ID = modifiedRooms.length - 1;
				}
			}
		});
		this.rooms = modifiedRooms;
		this.getStructuredRoomList();
	}

	// loading rooms for the router
	public loadRooms(RoomComponent, navigate) {
		this.zone.run(()=>{
			this.storage.setAndGetSetting({
				name: 'rooms',
				default: this.roomDefaults
			}).then((result: any) => {
				this.rooms = result;
				// loading storage rooms
				this.resetRouter(RoomComponent);
				// navigate to the first room if needed
				if (navigate) {
					this.router.navigate([this.rooms[0].name + '_' + this.rooms[0].ID]);
				}
				this.getStructuredRoomList();
			});
		});
	}

	// navigate to desired route
	public navigateTo(route){
		this.router.navigate([route], { replaceUrl: true });
	}

	// saving room configuraion
	public saveRooms() {
		return new Promise((resolve) => {
			this.storage.changeSetting({
				name: 'rooms',
				change: this.rooms
			}).then((res) => {
				this.getStructuredRoomList();
				resolve(res);
			});
		});
	}

	// resetting angular router
	public resetRouter(RoomComponent) {
		let results: any = [];
		for (let i = 0; i < this.rooms.length; i++) {
			results.push({
				// building room path
				path: this.rooms[i].name + '_' + this.rooms[i].ID,
				// using room component
				component: RoomComponent
			});
		}
		// resetting the router to settings
		this.router.resetConfig(results);
	}

	// get the element in any structure by ID
	public getComponent(ID){
		const comp = this.searchForComp(this.rooms, ID);
		if(comp){
			return comp;
		}
		return null;
	}

	// exec callback on each nested component inside arr
	// searches for deep components
	public modifyComponentList(arr, callback){
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

	public getComponentContainer(container){
		const containerID = container.element.nativeElement.parentNode.id;
		// modified ID due to needs
		let transformedID;
		// elem is placed in a popup
		if (containerID.indexOf('popup') !== -1) {
			transformedID = containerID.replace('popup_', '');
		}
		// elem is placed in a room
		if (containerID.indexOf('room') !== -1) {
			transformedID = parseInt(containerID.match(/(\d+)/)[0]);
		}
		// elem is placed in a swiper
		if (containerID.indexOf('swiper') !== -1) {
			transformedID = containerID.match(/(_[^_]+)$/)[0];
		}
		let comp = this.searchForComp(this.rooms, transformedID);
		if(comp){
			if(comp.attributes){
				if(comp.attributes.components){
					if(comp.attributes.components[0] && comp.attributes.components[0].components){
						// multi container
						const index = containerID.match(/\d+/)[0];
						return comp.attributes.components[index].components;
					}else{
						// single container
						return comp.attributes.components;
					}
				}
			}else{
				// return room components
				return comp.components;
			}
		}
		return null;
	}

	private searchForComp(arr, ID){
		for(let item of arr){
			// item found in top structure
			if(item.ID === ID){
				return item;
			}else{
				if(item.attributes){
					if(item.attributes.components){
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
							if(item.attributes.components){
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

	// determines if component can be edited
	// needs the ID of the component container
	// used for container in container components (poup in swiper)
	public canEdit(ID){
		if(this.settings.modes.roomEditFrom !== null){
			const container = this.getComponent(ID);
			if(container){
				// detect different ID's
				if(container.ID !== this.settings.modes.roomEditFrom){
					// check if component is in the container
					const isIn = this.searchForComp( (container.attributes ? container.attributes.components : container.components) , this.settings.modes.roomEditFrom);
					if(isIn){
						return false;
					}
				}
			}
		}
		return true;
	}

	// Selected element from Directives
	// get the current element
	// public selectedElement(elemID, container) {
	// 	return this.helper.find(this.roomComponents(container), 'ID', elemID).item;
	// }

	// returning the currently active list of components in: room or deeper structure
	// public roomComponents(container) {
	// 	const containerID = container.element.nativeElement.parentNode.id;
	// 	// elem is placed in a popup
	// 	if (containerID.indexOf('popup') !== -1) {
	// 		const popupID = containerID.replace('popup_', '');
	// 		return this.helper.find(this.rooms[this.currentRoom.ID].components, 'ID', popupID).item.attributes.components;
	// 	}
	// 	// elem is placed in a room
	// 	if (containerID.indexOf('room') !== -1) {
	// 		return this.rooms[this.currentRoom.ID].components;
	// 	}
	// 	// elem is placed in a swiper
	// 	if (containerID.indexOf('swiper') !== -1) {
	// 		const swiperIndex = containerID.match(/\d+/)[0];
	// 		const swiperID = containerID.replace('swiper_' + swiperIndex + '_', '');
	// 		return this.helper.find(this.rooms[this.currentRoom.ID].components, 'ID', swiperID).item.attributes.components[swiperIndex].components;
	// 	}
	// }

	// used to save the changed item position of a component
	// needs object of {item: 'position attributes of the item', dimenstions: 'dimensions that should be changed'}
	// will evaluate the available dimensions
	public saveItemPosition(obj, save) {
		for (const [key, value] of Object.entries(obj.dimensions)) {
			if (value !== undefined) {
				obj.item[key] = value + 'px';
			}
		}
		// saving rooms after changing if needed
		if(save){
			this.saveRooms();
		}
	}
}
