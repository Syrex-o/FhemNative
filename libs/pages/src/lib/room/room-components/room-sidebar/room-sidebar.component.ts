import { Component, HostBinding, Input, EventEmitter, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AddRoomComponent } from '@fhem-native/components';
import { EditorService, StructureService, UndoRedoService } from '@fhem-native/services';

import { Room } from '@fhem-native/types/room';

@Component({
	selector: 'fhem-native-room-sidebar',
	templateUrl: './room-sidebar.component.html',
	styleUrls: ['./room-sidebar.component.scss']
})

export class RoomSidebarComponent {
	@Input() expandState = false;
	@Input() mobile = false;

	@Output() backdropClick: EventEmitter<boolean> = new EventEmitter<boolean>();
	
	@HostBinding('class.mobile') get mobileBinding(){ return this.mobile; }
	@HostBinding('class.expanded') get expandBinding(){ return this.expandState; }

	coreEditor$ = this.editor.core.getMode();
	
	constructor(
		private router: Router,
		private editor: EditorService, 
		public structure: StructureService, 
		private undoManager: UndoRedoService,
		private popoverCtrl: PopoverController){
	}

	/**
	 * Change Room
	 * @param ID
	 */
	switchRoom(ID: number): void{
		this.toggleMobileMenu();

		const relRoom = this.structure.rooms.find(x=> x.ID === ID);
		if(relRoom) this.structure.changeRoom(relRoom);
	}

	switchPage(ref: string[]): void{
		this.toggleMobileMenu();
		setTimeout(()=> this.router.navigate(ref, {replaceUrl: true}), 50);
	}

	toggleMenu(): void{
		this.expandState = !this.expandState;
		this.backdropClick.emit(this.expandState);
	}

	private toggleMobileMenu(): void{
		if(this.mobile) this.toggleMenu();
	}

	drop(e: CdkDragDrop<string[]>): void {
		if(e.previousIndex === e.currentIndex) return;

		// increment --> Home room is fixed
		moveItemInArray(this.structure.rooms, e.previousIndex + 1, e.currentIndex + 1);
		this.structure.getStructuredRoomList();
		this.undoManager.addChange();
	}

	async editRoom(room: Room): Promise<void>{
		const popover = await this.popoverCtrl.create({
			component: AddRoomComponent,
			cssClass: 'add-room-popover',
			componentProps: { room }
		});

		await popover.present();
	}
}