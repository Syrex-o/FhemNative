import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';
import { ComponentLoaderService } from './component-loader.service';

import { DefaultRoom } from '@fhem-native/app-config';
import { decimalRounder, getUID } from '@fhem-native/utils';

import { Room, RoomParams } from '@fhem-native/types/room';
import { FhemComponentContainerSettings, FhemComponentSettings } from '@fhem-native/types/components';
import { NavController } from '@ionic/angular';

@Injectable({providedIn: 'root'})
export class StructureService {
    // list of all rooms
	// will be generated on start
	public rooms: Room[]= [];
    // list of structured rooms
	public structuredRooms: Room[] = [];
    // reserved storage of the current room for refereces
	// filled on room entrance
	public currentRoom: Room|undefined;

    constructor(
		public route: ActivatedRoute,
		public storage: StorageService, 
		public settings: SettingsService,
		public navCtrl: NavController,
		public componentLoader: ComponentLoaderService){
    }

	/**
	 * Find room by UID
	 * @param roomUID UID of room
	 * @returns Room, if found
	 */
	private findRoom(roomUID: string): Room|undefined {
		return this.rooms.find(x=> x.UID === roomUID);
	}

	/**
	 * Find roomIndex by UID
	 * @param roomUID UID of room
	 * @returns room index
	 */
	private findRoomIndex(roomUID: string): number {
		return this.rooms.findIndex(x=> x.UID === roomUID);
	}

    /**
	 * Get the current room
	 * @param roomUID: UID of room
	 */
	public getCurrentRoom(roomUID: string): void{
		const foundRoom = this.findRoom(roomUID);
		if(foundRoom) this.currentRoom = foundRoom;
	}

    /**
	 * navigate to certain room
	 * @param name: room name
	 * @param roomUID: UID of room
	 * @param params: rooom parameters
	 */
	protected navigateToRoom(roomUID: string, params?: RoomParams, backwards?: boolean) {
		const navigateTo = ['room', roomUID];
		const navigateptions = { relativeTo: this.route, replaceUrl: true, queryParams: params };

		if(!this.currentRoom || this.currentRoom.UID !== roomUID || !this.route.snapshot.queryParams['UID']){
			return backwards ? 
				this.navCtrl.navigateBack(navigateTo, navigateptions) : 
				this.navCtrl.navigateForward(navigateTo, navigateptions);
		}
		return null;
	}

	/**
	 * Change to room by room reference --> shorthand of navigateToRoom
	 * @param room: Room reference
	 */
	public changeRoom(room: Room, backwards?: boolean): void{
		const params: RoomParams = {name: room.name, UID: room.UID};
		this.navigateToRoom(room.UID, params, backwards);
	}

	/**
	 * Create New Room
	 * @returns: Room
	 */
	public createRoom(): Room {
		return { 
			name: '', 
			icon: 'home', 
			ID: this.rooms.length, 
			UID: getUID(), 
			components: []
		}
	}

	/**
	 * Add room to List
	 * @param room: Room
	 */
	public addRoom(room: Room): void{
		this.rooms.push(room);
		this.getStructuredRoomList();
	}

	/**
	 * Update specific room in structure
	 * @param roomUID UID of room
	 * @param room room data
	 */
	public updateRoom(roomUID: string, room: Room): void{
		const relRoom = this.findRoom(roomUID);
		if(!relRoom) return;

		relRoom.name = room.name;
		relRoom.icon = room.icon;

		this.getStructuredRoomList();
	}

	public deleteRoom(roomUID: string): void{
		const relRoomIndex = this.findRoomIndex(roomUID);
		if(relRoomIndex === -1) return;

		this.rooms.splice(relRoomIndex, 1);
		this.getStructuredRoomList();

		// check if currently in room
		if(roomUID === this.currentRoom?.UID) this.changeRoom(this.rooms[0]);
	}

	/**
	 * Bulk update rooms
	 * @param rooms 
	 */
	public updateRooms(rooms: Room[]): void{
		if(!this.currentRoom) return;

		this.rooms = rooms;
		this.getStructuredRoomList();
		this.getCurrentRoom(this.currentRoom.UID);
	}

    /**
	 * Load rooms from storage
	 * @param navigate: navigate to initial room
	 */
	public loadRooms(navigate?: boolean): Promise<void>{
        return new Promise((resolve)=>{
			this.storage.setAndGetSetting({name: 'rooms', default: JSON.stringify( [{...DefaultRoom}] )}).then((result: Room[])=>{
				// generate Unique ID for rooms, if not defined
				let allUID = true;
				result.forEach((room: Room)=>{
					if(!room.UID){
						allUID = false;
						room.UID = getUID();
					}
				});
				// save rooms, when new ID´s are generated
				if(!allUID) this.storage.changeSetting({name: 'rooms', change: JSON.stringify(result)});
				this.rooms = result;
				// navigate to room
				if(navigate) this.changeRoom(this.rooms[0]);
				this.getStructuredRoomList();
				resolve();
			});
		});
    }

	/**
	 * Save room configuration
	 */
	public async saveRooms(): Promise<void>{
		if(!this.currentRoom) return;
		
		// minify component config
		for(let component of this.getAllComponents()){
			component = await this.componentLoader.getCompressedFhemComponentConfig(component);
		}


		this.rooms = await this.storage.changeSetting({ name: 'rooms', change: JSON.stringify(this.rooms) });
		this.getCurrentRoom(this.currentRoom.UID);
		this.getStructuredRoomList();
	}

    /**
	 * Returning the list of rooms structured into submenus
	 */
	public getStructuredRoomList(): void{
		const structuredRooms: Room[] = JSON.parse(JSON.stringify(this.rooms));
		this.rooms.forEach((room: Room, i: number)=>{
			if(room.groupRooms){
				room.groupRooms.forEach((groupRoom, j: number)=>{
					const foundIndex: number = structuredRooms.findIndex(x=> x.ID === groupRoom.ID);
					if(foundIndex > -1){
						structuredRooms.splice(foundIndex, 1);
					}else{
						const relevantRoom: Room = this.rooms[i];
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

	/**
	 * Search for specific component
	 * @param componentId UID of component
	 */
	public getComponent(componentId: string): FhemComponentSettings|null{
		return ( this.searchForUID(componentId) as FhemComponentSettings|null );
	}

	public getAllComponents(searchSpace?: FhemComponentContainerSettings[]): FhemComponentSettings[]{
		const components: FhemComponentSettings[] = [];

		if(!searchSpace){
			for(const room of this.rooms){
				this.searchForComponent(room.components, '', (component)=> components.push(component));
			}
		}else{
			this.searchForComponent(searchSpace, '', (component)=> components.push(component));
		}
		return components;
	}

	/**
	 * Add component to room structure
	 * @param componentContainer 
	 * @param componentSettings 
	 */
	public addComponent(componentContainer: FhemComponentSettings[], componentSettings: FhemComponentSettings): void{
		componentContainer.push(componentSettings);
	}

	/**
	 * Update component in room structure
	 * @param containerId container ID of component
	 * @param componentSettings updated component settings
	 */
	public updateComponent(containerId: string, componentSettings: FhemComponentSettings): void{
		const componentContainer = this.getComponentContainer(containerId);
		if(!componentContainer) return;

		// search for component
		const compIndex = componentContainer.findIndex(x=> x.UID === componentSettings.UID);
		if(compIndex > -1) componentContainer[compIndex] = componentSettings;
	}

	/**
	 * Remove component in room structure
	 * @param containerId container ID of component
	 * @param componentSettings updated component settings
	 */
	public deleteComponent(containerId: string, componentId: string): void{
		const componentContainer = this.getComponentContainer(containerId);
		if(!componentContainer) return;

		const compIndex = componentContainer.findIndex(x=> x.UID === componentId);
		if(compIndex > -1) componentContainer.splice(compIndex, 1);
	}

	/**
	 * Search for specific component container
	 * @param containerId UID of component container
	 */
	public getComponentContainer(containerId: string): FhemComponentSettings[]|null {
		const result = this.searchForUID(containerId);
		if(result && 'components' in result) return ( result.components as FhemComponentSettings[] );
		return null;
	}

	/**
	 * 
	 * @param compList Any component list
	 * @param componentId UID of component
	 * @returns
	 */
	private searchForComponent(
		compList: (FhemComponentSettings | FhemComponentContainerSettings)[], 
		componentId: string, 
		cb?: (component: FhemComponentSettings)=> void
	): FhemComponentSettings|FhemComponentContainerSettings|null{
		for(const item of compList){
			if('UID' in item){
				if(cb !== undefined) cb(item);
				if(item.UID === componentId) return item;
			}
			if('containerUID' in item){
				if(item.containerUID === componentId) return item;
			}
			// deep search
			if(item.components){
				for(const subItem of item.components){
					const foundComponent = this.searchForComponent([subItem], componentId, cb);
					if(foundComponent) return foundComponent;
				}
			}
		}
		return null;
	}

	/**
	 * Searches for UID in Room structure
	 * Searches down the tree in nested components
	 * @param uid UID of component/room/container
	 * @returns first match, if found, of UID (Room or ComponentSettings or ComponentContainer)
	 */
	public searchForUID(uid: string): Room|FhemComponentSettings|FhemComponentContainerSettings|null{
		for(const room of this.rooms){
			if(room.UID === uid) return room;
			
			const component = this.searchForComponent(room.components, uid);
			if(component) return component;
		}
		return null;
	}

	public snapToGridGrid(p: number, n: number): number {
		return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
	}

	// round pixel position to grid
	public roundToGrid(p: number): number {
		const n: number = this.settings.app.grid.gridSize;
		return this.settings.app.grid.enabled ? this.snapToGridGrid(p, n) : p;
	}

	public getGridDecimal(): number{
		const n: number = this.settings.app.grid.gridSize;
		return 10 / (100 / (this.settings.app.grid.enabled ? n : 1));
	}

	public getGridPercentage(partDim: number, fullDim: number){
		return decimalRounder(( partDim / fullDim ) * 100, this.getGridDecimal());
	}
}