import { Injectable } from '@angular/core';

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

	constructor(
		private settings: SettingsService,
		private structure: StructureService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
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

	// load components for a room
	private loadRoomStructure(isEditMode?: boolean){
		// reassign current room
		this.structure.getCurrentRoom(this.structure.currentRoom.ID);
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

	// Change stack evaluation
	private evaluateStack(num: number){
		this.currentStack = (this.currentStack + num >= 0 ? this.currentStack + num : -1);

		if(this.currentStack === 0){
			this.roomBackup = JSON.parse(JSON.stringify(this.structure.rooms));
			this.structure.rooms = JSON.parse(JSON.stringify(this.roomBackup));
		}
	}

	// undo the last event
	public undoChange(){
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
		}
	}

	// redo the last event
	public redoChange(){
		if (this.dataRedoArray.length != 0) {
			this.dataUndoArray.push(this.dataCurrentArray.pop());
			this.dataCurrentArray.push(this.dataRedoArray.pop());
			// apply new structure
			this.structure.rooms = JSON.parse(JSON.stringify(this.dataCurrentArray[this.dataCurrentArray.length -1]));
			// evaluate the stack
			this.evaluateStack(1);
			// load relevant components
			this.loadRoomStructure(true);
		}
	}

	public cancelChanges(){
		// apply old structure
		this.structure.rooms = JSON.parse(JSON.stringify(this.roomBackup));
		// load relevant components
		this.loadRoomStructure();
		// reset values
		this.resetValues();
	}

	public applyChanges(){
		this.structure.saveRooms();
		// reset values
		this.resetValues();
	}

	private resetValues(){
		this.dataCurrentArray = [];
		this.dataUndoArray = [];
		this.dataRedoArray = [];
		this.roomBackup = [];
		this.currentStack = -1;
		this.selectComponent.copyList = [];
		this.settings.modeSub.next({
			roomEdit: false,
			roomEditFrom: null
		});
	}
}
