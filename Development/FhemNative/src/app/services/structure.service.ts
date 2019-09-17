import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { StorageService } from './storage.service';
import { HelperService } from './helper.service';

@Injectable({
	providedIn: 'root'
})

export class StructureService {
	constructor(
		private router: Router,
		private storage: StorageService,
		private helper: HelperService) {

	}
	// list of fhem components
	// gets filled on load to prevent circular dependencies
	public fhemComponents;

	// component copy
	// gets filled from context menu
	public componentCopy;

	// list of all rooms
	// will be generated on start
	public rooms: Array<any>;
	// list of room defauls
	// will be loaded on initial load
	private roomDefaults: Array<any> = [{
		ID: 0,
		name: 'Home',
		icon: 'home',
		components: []
	}];

	// reserved storage of the current room for refereces
	// filled of room entrance
	public currentRoom: any;

	// getting the room name
	public getCurrentRoom() {
		return this.helper.find(this.rooms, 'ID', parseInt(this.router.url.substr(this.router.url.length - 1, 1)));
	}

	// loading rooms for the router
	public loadRooms(RoomComponent, navigate) {
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
		});
	}

	// saving room configuraion
	public saveRooms() {
		return new Promise((resolve) => {
			this.storage.changeSetting({
				name: 'rooms',
				change: this.rooms
			}).then((res) => {
				resolve(res);
			});
		});
	}

	// resetting angular router
	public resetRouter(RoomComponent) {
		const results: any = [];
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

	// Selected element from Directives
	// get the current element
	public selectedElement(elemID, container) {
		return this.helper.find(this.roomComponents(container), 'ID', elemID).item;
	}

	// returning the currently active list of components in: room or deeper structure
	public roomComponents(container) {
		const containerID = container.element.nativeElement.parentNode.id;
		// elem is placed in a popup
		if (containerID.indexOf('popup') !== -1) {
			const popupID = containerID.replace('popup_', '');
			return this.helper.find(this.rooms[this.currentRoom.ID].components, 'ID', popupID).item.attributes.components;
		}
		// elem is placed in a room
		if (containerID.indexOf('room') !== -1) {
			return this.rooms[this.currentRoom.ID].components;
		}
		// elem is placed in a swiper
		if (containerID.indexOf('swiper') !== -1) {
			const swiperIndex = containerID.match(/\d+/)[0];
			const swiperID = containerID.replace('swiper_' + swiperIndex + '_', '');
			return this.helper.find(this.rooms[this.currentRoom.ID].components, 'ID', swiperID).item.attributes.components[swiperIndex].components;
		}
	}

	// used to save the changed item position of a component
	// needs object of {item: 'position attributes of the item', dimenstions: 'dimensions that should be changed'}
	// will evaluate the available dimensions
	public saveItemPosition(obj) {
		for (const [key, value] of Object.entries(obj.dimensions)) {
			if (value !== undefined) {
				obj.item[key] = value + 'px';
			}
		}
		// saving rooms after changing
		this.saveRooms();
	}
}
