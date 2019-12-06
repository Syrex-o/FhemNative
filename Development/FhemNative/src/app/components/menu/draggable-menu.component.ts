import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
// drag and drop
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RoomComponent } from '../room/room.component';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
	selector: 'draggable-menu',
	template: `
		<ng-container>
			<ion-header [ngClass]="settings.app.theme">
                <ion-toolbar>
                    <ion-title>Menu</ion-title>
                </ion-toolbar>
            </ion-header>
            <button *ngIf="!settings.modes.roomEdit && settings.app.enableEditing" class="btn-round fixed" matRipple [matRippleColor]="'#d4d4d480'" [ngClass]="settings.app.theme" (click)="settings.modeSub.next({roomEdit: true})">
				<ion-icon class="edit" name="md-create"></ion-icon>
			</button>
			<button-container></button-container>
			<ng-container *ngIf="structure.rooms.length > 0">
				<ion-content [ngClass]="settings.app.theme">
					<div cdkDropList class="list" (cdkDropListDropped)="drop($event, false)">
						<div class="box" *ngFor="let room of structure.structuredRooms" cdkDrag [cdkDragDisabled]="!settings.modes.roomEdit">
							<div class="custom-placeholder" *cdkDragPlaceholder></div>
							<ng-container *ngIf="room.useRoomAsGroup">
								<ion-item>
			                        <button class="button" matRipple [matRippleColor]="'#d4d4d480'" (click)="menu.close()" [routerDirection]="'root'" [routerLink]="[room.name+'_'+room.ID]">
			                            <ion-icon *ngIf="settings.modes.roomEdit" class="less-margin" slot="start" name="reorder"></ion-icon>
			                            <ion-icon *ngIf="settings.iconFinder(room.icon).type === 'ion'" class="less-margin" slot="start" [name]="room.icon"></ion-icon>
			                            <fa-icon *ngIf="settings.iconFinder(room.icon).type !== 'ion'" class="less-margin" [icon]="[settings.iconFinder(room.icon).type, room.icon]"></fa-icon>
			                            <ion-label>{{room.name}}</ion-label>
			                        </button>
			                        <button class="round float" matRipple [matRippleColor]="'#d4d4d480'" (click)="toggleSubMenu($event)">
			                            <ion-icon slot="end" name="md-funnel"></ion-icon>
			                        </button>
			                        <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="pen" name="md-create" *ngIf="settings.modes.roomEdit" (click)="editRoom(room)"></ion-icon>
			                        <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="trash" name="trash" *ngIf="settings.modes.roomEdit && structure.rooms.length > 1" (click)="removeRoom(room)"></ion-icon>
			                    </ion-item>
			                    <div cdkDropList class="list" (cdkDropListDropped)="drop($event, room)">
			                        <div class="box submenu" *ngFor="let groupRoom of room.groupRooms" cdkDrag [cdkDragDisabled]="!settings.modes.roomEdit">
			                            <div class="custom-placeholder" *cdkDragPlaceholder></div>
			                            <ion-item>
			                                <button class="button" matRipple [matRippleColor]="'#d4d4d480'" (click)="menu.close()" [routerDirection]="'root'" [routerLink]="[groupRoom.name+'_'+groupRoom.ID]">
			                                    <ion-icon *ngIf="settings.modes.roomEdit" class="less-margin" slot="start" name="reorder"></ion-icon>
			                                    <ion-icon *ngIf="settings.iconFinder(structure.rooms[groupRoom.ID].icon).type === 'ion'" class="less-margin" slot="start" [name]="structure.rooms[groupRoom.ID].icon"></ion-icon>
			                                    <fa-icon *ngIf="settings.iconFinder(structure.rooms[groupRoom.ID].icon).type != 'ion'" class="less-margin" [icon]="[settings.iconFinder(structure.rooms[groupRoom.ID].icon).type, structure.rooms[groupRoom.ID].icon]"></fa-icon>
			                                    <ion-label>{{groupRoom.name}}</ion-label>
			                                </button>
			                                <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="pen" name="md-create" *ngIf="settings.modes.roomEdit" (click)="editRoom(structure.rooms[groupRoom.ID])"></ion-icon>
			                                <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="trash" name="trash" *ngIf="settings.modes.roomEdit" (click)="removeRoom(structure.rooms[groupRoom.ID])"></ion-icon>
			                            </ion-item>
			                        </div>
			                    </div>
							</ng-container>
							<ng-container *ngIf="!room.useRoomAsGroup">
			                    <ion-item>
			                        <button class="button" matRipple [matRippleColor]="'#d4d4d480'" (click)="menu.close()" [routerDirection]="'root'" [routerLink]="[room.name+'_'+room.ID]">
			                            <ion-icon *ngIf="settings.modes.roomEdit" class="less-margin" slot="start" name="reorder"></ion-icon>
			                            <ion-icon *ngIf="settings.iconFinder(room.icon).type === 'ion'" class="less-margin" slot="start" [name]="room.icon"></ion-icon>
			                            <fa-icon *ngIf="settings.iconFinder(room.icon).type != 'ion'" class="less-margin" [icon]="[settings.iconFinder(room.icon).type, room.icon]"></fa-icon>
			                            <ion-label>{{room.name}}</ion-label>
			                        </button>
			                        <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="pen" name="md-create" *ngIf="settings.modes.roomEdit" (click)="editRoom(room)"></ion-icon>
			                        <ion-icon matRipple [matRippleColor]="'#d4d4d480'" class="trash" name="trash" *ngIf="settings.modes.roomEdit && structure.rooms.length > 1" (click)="removeRoom(room)"></ion-icon>
			                    </ion-item>
			                </ng-container>
						</div>
					</div>
					<ng-content select="[body]"></ng-content>
		        </ion-content>
			</ng-container>
		</ng-container>
	`,
	styles: [`
		:host{
			height: 100%;
		}
		ion-content{
			overflow-y: auto;
		}
		.box {
			padding: 10px 10px;
			border-bottom: solid 1px #ccc;
			color: rgba(0, 0, 0, 0.87);
			display: block;
			align-items: center;
			justify-content: space-between;
			box-sizing: border-box;
			background: white;
			font-size: 14px;
		}
		.box .disabled{
			pointer-events: none;
		}
		.box .list .submenu{
			max-height: 0;
	  		overflow: hidden;
	  		border-bottom: none;
	  		padding: 0px 10px;
	  		transition: all .2s ease;
	  	}

	  	.box .list .submenu ion-item{
	    	--padding-end: 0px;
	    	--inner-padding-end: 0px;
	    }
	    .box .show-submenu ~ .list .submenu{
			max-height: 60px;
			padding: 5px 10px;
		}
		ion-item button{
			background: transparent;
			font-size: 16px;
		}
		ion-item button ion-icon,
		ion-item button fa-icon{
			font-size: 24px;
			width: 1em;
		}
		button:focus{
			outline: 0px;
		}
		ion-item button.button{
			width: 100%;
			height: 100%;
			display: inline-flex;
			padding-left: 0;
			line-height: 24px;
		}
		ion-item button.round{
			border-radius: 50%;
			line-height: 30px;
			width: 30px;
			height: 30px;
			padding: 0;
		}
		ion-item button.float{
			float: right;
		}
		ion-item button.round fa-icon,
		ion-item button.round ion-icon{
			width: 100%;
			height: inherit;
		}
		ion-item{
			width: 100%;
			padding-right: 0px;
			--box-shadow: 0px;
			--inner-border-width: 0px;
		}
		ion-label{
			margin-left: 8px;
		}
		.cdk-drag-preview {
			box-sizing: border-box;
			border-radius: 4px;
			box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
		}
		.list.cdk-drop-list-dragging .box:not(.cdk-drag-placeholder) {
			transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
		}
		.cdk-drag-animating {
			transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
		}
		.custom-placeholder {
			border: dotted 1px #999;
			min-height: 60px;
			transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
		}
		.pen {
			font-size: 26px;
			margin-right: 10px;
		}
		.btn-round{
			position: relative;
			float: right;
			margin-right: 8px;
			width: 45px;
		    height: 45px;
		    border-radius: 50%;
		    border: none;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		    z-index: 100;
		}
		.btn-round.fixed{
			position: fixed;
			top: 5px;
			right: 0px;
			z-index: 10000;
		}
		.btn-round ion-icon{
		    font-size: 25px;
		}
		.btn-round .edit,
		.btn-round .change{
			color: var(--btn-blue);
		}
		.btn-round .save{
			color: var(--btn-green);
		}
		.btn-round .cancel{
			color: var(--btn-red);
		}
		.btn-round .save,
		.btn-round .cancel,
		.btn-round .change{
			font-size: 32px;
		}

		.dark ion-label{
			--color: var(--dark-p);
		}

		.dark ion-icon,
		.dark fa-icon,
		.dark p{
			color: var(--dark-p);
		}

		ion-content.dark ,
		.dark ion-toolbar,
		.dark .box,
		.dark .custom-placeholder,
		.dark .list,
		.dark input,
		.dark ion-item,
		.dark.btn-round{
			background: var(--dark-bg);
			--background: var(--dark-bg);
		}
	`]
})
export class DraggableMenuComponent {

	constructor(
		public settings: SettingsService,
		public structure: StructureService,
		public menu: MenuController,
		private undoManager: UndoRedoService){
	}

	// drop room in list
	public drop(event: CdkDragDrop<string[]>, subMenu) {
		moveItemInArray((!subMenu ? this.structure.structuredRooms : subMenu.groupRooms), event.previousIndex, event.currentIndex);
		this.structure.modifyRooms();
		this.structure.resetRouter(RoomComponent);
		// inform undo manager
		this.undoManager.addChange();
		// navigate if current room was moved
		if(event.previousIndex === this.structure.currentRoom.ID){
			this.structure.navigateTo(this.structure.currentRoom.name+'_'+event.currentIndex);
		}
	}

	public removeRoom(selectedRoom) {
		this.structure.rooms.splice(selectedRoom.ID, 1);
		// check if group room was deleted and current route is in group room
		const inGroup: boolean = selectedRoom.groupRooms && selectedRoom.groupRooms.find(el => el.ID === this.structure.currentRoom.ID) ? true : false;
		this.structure.modifyRooms();
		this.structure.resetRouter(RoomComponent);
		// inform undo manager
		this.undoManager.addChange();
		// navigate if current room was removed
		if(selectedRoom.ID === this.structure.currentRoom.ID){
			this.structure.navigateTo(this.structure.rooms[0].name+'_'+this.structure.rooms[0].ID);
		}
		// navigate if in group after changes
		if(inGroup){
			this.structure.navigateTo(this.structure.rooms[0].name+'_'+this.structure.rooms[0].ID);
		}
	}

	// show submenu items
	public toggleSubMenu(event){
		event.target.parentNode.parentNode.classList.toggle('show-submenu');
	}

	public editRoom(room) {
		this.menu.close();	
		this.structure.selectedRoom = room;
		this.settings.modeSub.next({changeRoom: true});
	}
}