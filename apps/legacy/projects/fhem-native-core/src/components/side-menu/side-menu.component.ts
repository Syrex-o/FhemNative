import { Component, NgModule, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { IconModule } from '@FhemNative/components/icon/icon.component';
import { RoomColorModule } from '@FhemNative/directives/room-color.directive';
import { EditButtonComponentModule } from '@FhemNative/components/edit-button/edit-button.component';

// Drag And Drop
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Ionic
import { ModalController, IonicModule } from '@ionic/angular';
// Translate
import { TranslateModule } from '@ngx-translate/core';

// Services
import { TaskService } from '@FhemNative/services/task.service';
import { LoggerService } from '@FhemNative/services/logger/logger.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { UndoRedoService } from '@FhemNative/services/undo-redo.service';
import { StructureService } from '@FhemNative/services/structure.service';
import { ComponentLoaderService } from '@FhemNative/services/component-loader.service';

// Animation
import { ShowHide, SlideMenu } from './animations';
import { MenuStagger } from '../../animations/animations';
// Interfaces
import { Room, RoomParams } from '../../interfaces/interfaces.type';

@Component({
	selector: 'fhemnative-side-menu',
	templateUrl: './side-menu.component.html',
	styleUrls: ['./side-menu.component.scss'],
	animations: [MenuStagger, ShowHide, SlideMenu]
})
export class SideMenuComponent {
	// menu button press for settings
	@Output() onSettingsClick: EventEmitter<boolean> = new EventEmitter();

	constructor(
		public task: TaskService,
		private logger: LoggerService,
		public settings: SettingsService,
		public structure: StructureService,
		private undoManager: UndoRedoService,
		private modalController: ModalController,
		private componentLoader: ComponentLoaderService){
	}

	toggleMenu(): void{
		this.settings.menuState = !this.settings.menuState;
	}

	// switch room
	switchRoom(name: string, ID: number, reload?: boolean): void{
		this.logger.info('Switch room to: ' + name);

		const roomToSwitch: Room|undefined = this.structure.rooms.find(x=> x.ID === ID);
		// router params
		if(roomToSwitch){
			const params: RoomParams = {
				name: name,
				ID: ID,
				UID: roomToSwitch.UID,
				reload: reload || false,
				reloadID: this.settings.getUID()
			}
			this.structure.navigateToRoom(name, ID, params);
			this.settings.menuState = false;
		}
	}

	// check if room from menu is active --> just for group rooms to keep menu unfold, when one of group rooms is current room
	checkGroup(groupRooms: Array<any>|undefined): boolean{
		if(groupRooms){
			// search for ID in currentroom
			return groupRooms.find(x=> x.ID === this.structure.currentRoom.ID);
		}
		return false;
	}

	// show submenu items
	toggleSubMenu(event: any): void{
		event.target.parentNode.parentNode.classList.toggle('show-submenu');
	}

	// Edit specific room
	editRoom(ID: number): void{
		this.logger.info('Editing room: ' + this.structure.rooms[ID].name);
		this.componentLoader.createSingleComponent('CreateEditRoomComponent', this.componentLoader.containerStack[0].container, {
			type: 'edit', ID: ID
		});
		this.settings.menuState = false;
	}

	// remove room
	removeRoom(ID: number): void{
		const room = JSON.parse(JSON.stringify(this.structure.rooms[ID]));
		this.structure.rooms.splice(ID, 1);
		this.logger.info('Removed room: ' + room.name);
		// check if group room was deleted and current route is in group room
		const inGroup: boolean = room.groupRooms && room.groupRooms.find((el: any) => el.ID === this.structure.currentRoom.ID) ? true : false;
		this.structure.modifyRooms();
		// inform undo manager
		this.undoManager.addChange();
		// navigate if current room was removed
		// navigate if in group after changes
		if(ID === this.structure.currentRoom.ID || inGroup){
			this.switchRoom(this.structure.rooms[0].name, this.structure.rooms[0].ID, true);
		}
	}

	// drop room in list
	drop(e: any, subMenu: any): void {
		const event: CdkDragDrop<string[]> = e;
		if(event.previousIndex !== event.currentIndex){
			// move items
			moveItemInArray((!subMenu ? this.structure.structuredRooms : subMenu.groupRooms), event.previousIndex, event.currentIndex);
			this.logger.info('Room order changed');
			this.structure.modifyRooms();
			// inform undo manager
			this.undoManager.addChange();
			// navigate if current room was moved
			// change room, if room was moved to level 0
			if(!subMenu){
				if(event.previousIndex === this.structure.currentRoom.ID || event.currentIndex === 0){
					this.switchRoom(this.structure.rooms[0].name, this.structure.rooms[0].ID, true);
				}
			}else{
				// navigate if current room was moved, while moving in group
				const group = subMenu.groupRooms;
				const currentIndex = group.findIndex((x: any) => x.ID === this.structure.currentRoom.ID);
				// check if item in submenu was moved and is current room
				if(currentIndex > -1 && ( event.previousIndex === currentIndex || event.currentIndex === 0 )){
					this.switchRoom(group[0].name, group[0].ID, true);
				}
			}
		}
	}

	// settings
	openSettings(): void{
		this.logger.info('Switch room to: Settings');
		this.settings.menuState = false;
		this.onSettingsClick.emit(true);
	}

	// open page
	async openPage(page: string): Promise<any>{
		this.logger.info('Switch room to: ' + page);
		this.settings.menuState = false;
		// load page comp
		const comp: any = await this.componentLoader.loadDynamicComponent(page+'/'+page, false);
		// create modal
		const modal = await this.modalController.create({
			component: comp,
			backdropDismiss: false,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
	}
}

@NgModule({
	declarations: [ SideMenuComponent ],
	imports: [ 
		IconModule,
		IonicModule, 
		CommonModule, 
		DragDropModule, 
		RoomColorModule, 
		TranslateModule,
		EditButtonComponentModule
	],
	exports: [ SideMenuComponent ]
})
export class SideMenuModule { }