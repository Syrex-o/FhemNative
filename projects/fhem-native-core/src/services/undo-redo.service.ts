import { Injectable } from '@angular/core';

// interfaces
import { Room, RoomParams } from '../interfaces/interfaces.type';

import { FhemService } from './fhem.service';
import { SettingsService } from './settings.service';
import { StructureService } from './structure.service';
import { SelectComponentService } from './select-component.service';
import { ComponentLoaderService } from './component-loader.service';

@Injectable({
	providedIn: 'root'
})

export class UndoRedoService {
	private dataCurrentArray: Array<any> = [];
  	public dataUndoArray: Array<any> = [];
  	public dataRedoArray: Array<any> = [];

  	// room backup on initial edit
	private roomBackup: Array<any> = [];
	// current room stack
	private currentStack: number = -1;
	// last edit mode
	private lastMode: boolean = false;

	constructor(
		private fhem: FhemService,
		private settings: SettingsService,
		private structure: StructureService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
		// subscribe to room editor
		this.settings.modeSub.subscribe(next =>{
			if(next.hasOwnProperty('roomEdit')){
				if(next.roomEdit){
					if(this.lastMode !== next.roomEdit){
						this.lastMode = next.roomEdit;
						this.currentStack = -1;
						this.addChange();
					}
				}else{
					this.lastMode = false;
				}
			}
		});
	}

	// load components for a room
	private loadRoomStructure(isEditMode?: boolean): void{
		// reassign current room
		this.structure.getCurrentRoom(this.structure.currentRoom.ID);
		const reloaded: boolean = this.checkForRoomChange();
		// get the structured room list
		this.structure.getStructuredRoomList();
		// reload all components in room
		this.componentLoader.loadRoomComponents(this.structure.currentRoom.components, this.componentLoader.containerStack[0].container, true);
		// only reassign edit properties and load grid if needed
		if(isEditMode){
			// tell the indicator, that editing was triggered from room with ID
			this.settings.modeSub.next({roomEditFrom: this.structure.currentRoom.ID});
			// revert editing back to initial room container
			this.componentLoader.currentContainerSub.next({
				ID: this.structure.currentRoom.ID,
				action: 'initial',
				container: this.componentLoader.containerStack[0].container
			});
		}else{
			// clear the stack
			this.componentLoader.containerStack = [this.componentLoader.containerStack[0]];
			this.componentLoader.currentContainer = this.componentLoader.containerStack[0].container;
		}
		// clear the selection containers
		this.selectComponent.selectorList = [];
	}

	// Mark a change to the structure
	public addChange(): void{
		// evaluate the stack
		this.evaluateStack(1);

		this.dataRedoArray = [];
		if (this.dataCurrentArray.length === 0) {
        	this.dataCurrentArray.push(JSON.parse(JSON.stringify(this.structure.rooms)));    
      	}else{
      		this.dataUndoArray.push(this.dataCurrentArray.pop());
      		this.dataCurrentArray.push(JSON.parse(JSON.stringify(this.structure.rooms)));
      	}
      	// getting structured room list to ensure, that list is up to date
		this.structure.getStructuredRoomList();
	}

	// Change stack evaluation
	private evaluateStack(num: number): void{
		this.currentStack = (this.currentStack + num >= 0 ? this.currentStack + num : -1);

		if(this.currentStack === 0){
			this.roomBackup = JSON.parse(JSON.stringify(this.structure.rooms));
			this.structure.rooms = JSON.parse(JSON.stringify(this.roomBackup));
		}
	}

	// undo the last event
	public undoChange(): void{
		if (this.dataUndoArray.length != 0) {
			this.dataRedoArray.push(this.dataCurrentArray.pop());
			this.dataCurrentArray.push(this.dataUndoArray.pop());
			// remove all fhem components
			// apply new structure
			this.structure.rooms = JSON.parse(JSON.stringify(this.dataCurrentArray[this.dataCurrentArray.length -1]));
			// evaluate the stack
			this.evaluateStack(-1);
			// load relevant components
			this.loadRoomStructure(true);
			// grouper update
			this.selectComponent.groupHandler.next(true);
		}
	}

	// redo the last event
	public redoChange(): void{
		if (this.dataRedoArray.length != 0) {
			this.dataUndoArray.push(this.dataCurrentArray.pop());
			this.dataCurrentArray.push(this.dataRedoArray.pop());
			// apply new structure
			this.structure.rooms = JSON.parse(JSON.stringify(this.dataCurrentArray[this.dataCurrentArray.length -1]));
			// evaluate the stack
			this.evaluateStack(1);
			// load relevant components
			this.loadRoomStructure(true);
			// grouper update
			this.selectComponent.groupHandler.next(true);
		}
	}

	public cancelChanges(): void{
		// apply old structure
		this.structure.rooms = JSON.parse(JSON.stringify(this.roomBackup));
		// load relevant components
		this.loadRoomStructure();
		// reset values
		this.resetValues();
	}

	public applyChanges(): void{
		// remove all selections
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
		this.structure.saveRooms().then((res)=>{
			if('sharedConfig' in this.settings.app && this.settings.app.sharedConfig.enable){
				this.componentLoader.getMinifiedConfig().then((miniConf: Room[])=>{
					// send miniconf to fhem reading
					this.fhem.setAttr(
						this.settings.app.sharedConfig.device,
						this.settings.app.sharedConfig.reading,
						JSON.stringify(miniConf)
					);
				});
			}
		});
		// reset values
		this.resetValues();
	}

	// check if room needs to be changed --> room created, then cancel/undo
	private checkForRoomChange(): boolean{
		// check if current room is in rooms
		const found: Room|undefined = this.structure.rooms.find((x: Room)=> x.UID === this.structure.currentRoom.UID);
		if(!found){
			// navigation needed --> room was created during editing
			const roomTo: Room = this.structure.rooms[0];
			const params: RoomParams = { name: roomTo.name, ID: roomTo.ID, UID: roomTo.UID, reload: false };
			this.structure.navigateToRoom(roomTo.name, roomTo.ID, params);
			this.structure.getCurrentRoom(roomTo.ID);
			return true;
		}
		return false;
	}

	private resetValues(): void{
		this.dataCurrentArray = [];
		this.dataUndoArray = [];
		this.dataRedoArray = [];
		this.roomBackup = [];
		this.currentStack = -1;
		this.selectComponent.copyList = [];
		this.settings.modeSub.next({ roomEdit: false, roomEditFrom: null });
	}
}
