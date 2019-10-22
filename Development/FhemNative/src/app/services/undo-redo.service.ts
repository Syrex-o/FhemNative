import { Injectable } from '@angular/core';

import { SettingsService } from './settings.service';
import { StructureService } from './structure.service';
import { CreateComponentService } from './create-component.service';

// Room Component
import { RoomComponent } from '../components/room/room.component';

@Injectable({
	providedIn: 'root'
})

export class UndoRedoService {
	private dataCurrentArray: Array<any> = [];
  	private dataUndoArray: Array<any> = [];
  	private dataRedoArray: Array<any> = [];

  	// room backup on initial edit
	private roomBackup: Array<any> = [];
	// current room stack
	private currentStack: number = -1;

	constructor(
		private settings: SettingsService,
		private structure: StructureService,
		private createComponent: CreateComponentService){
		// subscribe to room editor
		this.settings.modeSub.subscribe(next =>{
			if(next.hasOwnProperty('roomEdit')){
				if(next.roomEdit){
					this.currentStack = -1;
					this.addChange();
				}
			}
		});
	}

	public cancelChanges(){
		// remove fhem components
		this.removeFhemComponents();
		// apply old structure
		this.structure.rooms = this.roomBackup;
		// load relevant components
		this.loadRoomStructure();
		// reset values
		this.resetValues();
	}

	private loadRoomStructure(){
		// filling current room in structure
		this.structure.currentRoom = this.structure.getCurrentRoom().item;
		// get the structured room list
		this.structure.getStructuredRoomList();
		// load components
		this.createComponent.loadRoomComponents(this.structure.currentRoom.components, this.createComponent.currentRoomContainer, false);
		// reset router
		this.structure.resetRouter(RoomComponent);
	}

	public addChange(){
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

	private evaluateStack(num){
		this.currentStack = (this.currentStack + num >= 0 ? this.currentStack + num : -1);

		if(this.currentStack === 0){
			this.roomBackup = JSON.parse(JSON.stringify(this.structure.rooms));
			this.structure.rooms = JSON.parse(JSON.stringify(this.roomBackup));
		}
	}

	private removeFhemComponents(){
		this.structure.getCurrentRoom().item.components.forEach((component)=>{
			this.createComponent.removeFhemComponent(component.ID);
		});
	}

	public undoChange(){
		if (this.dataUndoArray.length != 0) {
			this.dataRedoArray.push(this.dataCurrentArray.pop());
			this.dataCurrentArray.push(this.dataUndoArray.pop());
			// remove all fhem components
			this.removeFhemComponents();
			// apply new structure
			this.structure.rooms = JSON.parse(JSON.stringify(this.dataCurrentArray[this.dataCurrentArray.length -1]));
			// evaluate the stack
			this.evaluateStack(-1);
			// load relevant components
			this.loadRoomStructure();
		}
	}

	public redoChange(){
		if (this.dataRedoArray.length != 0) {
			this.dataUndoArray.push(this.dataCurrentArray.pop());
			this.dataCurrentArray.push(this.dataRedoArray.pop());
			// remove all fhem components
			this.removeFhemComponents();
			// apply new structure
			this.structure.rooms = JSON.parse(JSON.stringify(this.dataCurrentArray[this.dataCurrentArray.length -1]));
			// evaluate the stack
			this.evaluateStack(1);
			// load relevant components
			this.loadRoomStructure();
		}
	}

	private resetValues(){
		this.dataCurrentArray = [];
		this.dataUndoArray = [];
		this.dataRedoArray = [];
		this.roomBackup = [];
		this.currentStack = -1;
	}

	public applyChanges(){
		this.structure.saveRooms();
		// reset values
		this.resetValues();
	}
}
