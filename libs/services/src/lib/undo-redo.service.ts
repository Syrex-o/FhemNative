import { Injectable } from '@angular/core';

import { StructureService } from './structure.service';
import { ComponentLoaderService } from './component-loader.service';

import { clone } from '@fhem-native/utils';

import { Room } from '@fhem-native/types/room';
import { ContainerRegistry } from '@fhem-native/types/components';

@Injectable({
	providedIn: 'root'
})
export class UndoRedoService {
	private currentArray: Array<any> = [];
	public undoArray: Room[] = [];
	public redoArray: Room[] = [];

	// room backup on initial edit
	private roomBackup: Room[] = [];
	// current room stack
	private currentStack = -1;

	constructor(
		protected structure: StructureService,
		protected compLoader: ComponentLoaderService){
	}

	public init() {
		this.currentStack = -1;
        this.addChange();
	}

	public reset(){
		this.currentArray = [];
		this.undoArray = [];
		this.redoArray = [];
		this.roomBackup = [];
		this.currentStack = -1;
	}

	private removeCurrentComponents(): ContainerRegistry|null{
		if(!this.structure.currentRoom) return null;

		// ensure that all components are present
		this.structure.getCurrentRoom(this.structure.currentRoom.UID);

		const containerRegistry = this.compLoader.getContainerRegistry(this.structure.currentRoom.UID);
		if(!containerRegistry) return null;

		for(const componentSettigns of this.structure.currentRoom.components){
			const componentRegistry = this.compLoader.getComponentFromRegistry(componentSettigns.UID);
			if(!componentRegistry) continue;

			this.compLoader.destroyComponent(componentRegistry);
		}
		return containerRegistry;
	}

	// Mark a change to the structure
	public addChange(): void{
		// evaluate the stack
		this.evaluateStack(1);

		this.redoArray = [];
		if (this.currentArray.length === 0) {
        	this.currentArray.push( clone(this.structure.rooms) );    
      	}else{
			this.undoArray.push( this.currentArray.pop() );
      		this.currentArray.push( clone(this.structure.rooms) );
      	}
      	// getting structured room list to ensure, that list is up to date
		this.structure.getStructuredRoomList();
	}

	// Change stack evaluation
	private evaluateStack(num: number): void{
		this.currentStack = (this.currentStack + num >= 0 ? this.currentStack + num : -1);

		if(this.currentStack === 0){
			this.roomBackup = clone(this.structure.rooms);
			this.structure.rooms = clone(this.roomBackup);
		}
	}

	// undo the last event
	public undoChange(): void{
		if(this.undoArray.length === 0) return;

		this.redoArray.push(this.currentArray.pop());
		this.currentArray.push(this.undoArray.pop());
		// remove components
		const containerRegistry = this.removeCurrentComponents();

		// apply new structure
		this.structure.updateRooms( clone(this.currentArray[this.currentArray.length -1]) );
		// evaluate the stack
		this.evaluateStack(-1);

		// load relevant components
		if(containerRegistry && this.structure.currentRoom) this.compLoader.loadContainerComponents(this.structure.currentRoom.components, containerRegistry);
	}

	// redo the last event
	public redoChange(): void{
		if(this.redoArray.length === 0) return;
		
		this.undoArray.push(this.currentArray.pop());
		this.currentArray.push(this.redoArray.pop());
		// remove components
		const containerRegistry = this.removeCurrentComponents();

		// apply new structure
		this.structure.updateRooms( clone(this.currentArray[this.currentArray.length -1]) );
		// evaluate the stack
		this.evaluateStack(1);

		// load relevant components
		if(containerRegistry && this.structure.currentRoom) this.compLoader.loadContainerComponents(this.structure.currentRoom.components, containerRegistry);
	}

	public cancelChanges(): void{
		if(!this.structure.currentRoom) return;

		// remove components
		const containerRegistry = this.removeCurrentComponents();

		// apply old structure
		this.structure.updateRooms( clone(this.roomBackup) );

		// load relevant components
		if(containerRegistry) this.compLoader.loadContainerComponents(this.structure.currentRoom.components, containerRegistry);

		// reset values
		this.reset();
	}

	public async applyChanges(): Promise<void>{
		// remove all selections
		// this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
        await this.structure.saveRooms();


		// this.structure.saveRooms().then((res)=>{
		// 	if('sharedConfig' in this.settings.app && this.settings.app.sharedConfig.enable){
		// 		this.componentLoader.getMinifiedConfig().then((miniConf: Room[])=>{
		// 			// send miniconf to fhem reading
		// 			this.fhem.setAttr(
		// 				this.settings.app.sharedConfig.device,
		// 				this.settings.app.sharedConfig.reading,
		// 				JSON.stringify(miniConf)
		// 			);
		// 		});
		// 	}
		// });
		// reset values
		this.reset();
	}
}
