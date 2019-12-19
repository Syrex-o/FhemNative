import { Component, OnDestroy } from '@angular/core';
import { RoomComponent } from '../room/room.component';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { CreateComponentService } from '../../services/create-component.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'create-room',
	template: `
	<div class="create-container room" [ngClass]="settings.app.theme">
		<button matRipple [matRippleColor]="'#d4d4d480'" class="add-btn" (click)="openMenu()">
			<span class="line top"></span>
			<span class="line bottom"></span>
		</button>
	</div>
	<popup
		*ngIf="editMode"
		[customMode]="true"
		[(ngModel)]="editMode"
		[headLine]="editRoom ? ('GENERAL.CHANGE_ROOM.TITLE' | translate) : ('GENERAL.CREATE_ROOM.TITLE' | translate)"
		[fixPosition]="true"
		(onClose)="settings.modeSub.next({changeRoom: false});"
		[ngClass]="settings.app.theme">
		<div class="room-options">
			<input [(ngModel)]="roomName" [placeholder]="'GENERAL.CREATE_ROOM.ROOM_NAME' | translate">
			<span class="bar"></span>
			<p>{{'GENERAL.CREATE_ROOM.ROOM_ICON' | translate}}</p>
			<ng-select [items]="settings.icons"
				[searchable]="false"
				bindLabel="icon"
				placeholder="roomIcon"
				[(ngModel)]="roomIcon">
				<ng-template ng-option-tmp let-item="item" let-index="index">
				    <ion-icon *ngIf="item.type === 'ion'" [name]="item.icon"></ion-icon>
				    <fa-icon *ngIf="item.type != 'ion'" [icon]="[item.type, item.icon]"></fa-icon>
				    <span class="label">{{item.icon}}</span>
				</ng-template>
			</ng-select>
			<switch
				[customMode]="true"
				[padding]="false"
				[(ngModel)]="useRoomAsGroup"
				[label]="'GENERAL.CREATE_ROOM.USE_AS_GROUP.TITLE' | translate"
				[subTitle]="'GENERAL.CREATE_ROOM.USE_AS_GROUP.INFO' | translate"
				(onToggle)="grouper('useAsGroup', $event)">
			</switch>
			<switch *ngIf="groupRooms.length > 0"
				[customMode]="true"
				[padding]="false"
				[(ngModel)]="roomToGroup"
				[label]="'GENERAL.CREATE_ROOM.GROUP_TO.TITLE' | translate"
				[subTitle]="'GENERAL.CREATE_ROOM.GROUP_TO.INFO' | translate"
				(onToggle)="grouper('roomToGroup', $event)">
			</switch>
			<ng-select *ngIf="roomToGroup && groupRooms.length > 0" [items]="groupRooms"
				[searchable]="false"
				bindLabel="name"
				[(ngModel)]="selectedGroup">
				<ng-template ng-option-tmp let-item="item" let-index="index">
				    <span class="label">{{item.name}}</span>
				</ng-template>
			</ng-select>
			<button ion-button class="btn submit" (click)="saveRoom(roomName)">{{'GENERAL.BUTTONS.SAVE' | translate}}</button>
			<button ion-button class="btn cancel" (click)="editMode = false;">{{'GENERAL.BUTTONS.CANCEL' | translate}}</button>
			<p class="error-message" *ngIf="addEvent == 'room-error'">{{'GENERAL.CREATE_ROOM.NO_ROOM_NAME' | translate}}</p>
			<p class="success-message" *ngIf="addEvent == 'room-added'">{{'GENERAL.CREATE_ROOM.ROOM_CREATED' | translate}}</p>
		</div>
	</popup>
	`,
	styleUrls: ['./create-style.scss']
})
export class CreateRoomComponent implements OnDestroy {
	private editSub: Subscription;
	// room edit instead of create
	public editRoom: boolean = false;

	public editMode: boolean = false;
	public addEvent: string;

	// Room Parameters
	public roomName: string;
	public roomIcon: any = {type: 'ion', icon: 'home'};
	public useRoomAsGroup: boolean = false;
	public roomToGroup: boolean = false;

	public groupRooms: Array<any> = [];
	public selectedGroup: any = {};

	constructor(
		private structure: StructureService,
		public settings: SettingsService,
		private createComponent: CreateComponentService,
		private helper: HelperService,
		private undoManager: UndoRedoService) {
		// subscribe to editing
		this.editSub = this.settings.modeSub.subscribe(next =>{
	  		if(next.hasOwnProperty('changeRoom')){
				if(next.changeRoom){
					// edit mode
					this.openMenu();
					// editing comes from menu
					this.editRoom = true;
					this.editRoomProp();
				}else{
					// finish edit mode
					this.editRoom = false;
					this.resetValues();
				}
			}
	  	});
	}

	public openMenu(){
		this.editMode = true;
		this.groupRooms = this.structure.rooms.filter(room => room.useRoomAsGroup);
	}

	public saveRoom(room) {
		if (room) {
			if(!this.editRoom){
				// room is created
				this.structure.rooms.push({
					ID: this.structure.rooms.length,
					UID: this.helper.UIDgenerator(),
					name: room,
					icon: this.roomIcon.icon,
					components: []
				});
				if(this.useRoomAsGroup){
					this.structure.rooms[this.structure.rooms.length -1]['useRoomAsGroup'] = true;
					if(!this.structure.rooms[this.structure.rooms.length -1]['groupRooms']){
						this.structure.rooms[this.structure.rooms.length -1]['groupRooms'] = [];
					}
				}
				if(this.selectedGroup.name){
					// check if group already has rooms inside
					if(!this.structure.rooms[this.selectedGroup.ID]['groupRooms']){
						this.structure.rooms[this.selectedGroup.ID]['groupRooms'] = [];
					}
					this.structure.rooms[this.selectedGroup.ID]['groupRooms'].push({
						ID: this.structure.rooms[this.structure.rooms.length -1].ID,
						name: this.structure.rooms[this.structure.rooms.length -1].name
					});
				}
				this.addEvent = 'room-added';
				this.structure.resetRouter(RoomComponent);
				this.structure.getStructuredRoomList();
				this.resetValues();
				// inform undo manager
				this.undoManager.addChange();
			}else{
				// room is edited
				this.applyRoomChanges();
				this.structure.resetRouter(RoomComponent);
				this.structure.getStructuredRoomList();
				this.resetValues();
				// inform undo manager
				this.undoManager.addChange();

				// navigate if current room was edited
				if(this.structure.selectedRoom.ID === this.structure.currentRoom.ID){
					this.structure.navigateTo(this.structure.rooms[this.structure.selectedRoom.ID].name+'_'+this.structure.rooms[this.structure.selectedRoom.ID].ID);
				}
			}
		} else {
			this.addEvent = 'room-error';
		}
	}

	public grouper(scenario, event){
		if(event){
			if(scenario === 'useAsGroup'){
				this.roomToGroup = false;
			}else{
				this.useRoomAsGroup = false;
			}
		}
	}

	private editRoomProp() {
		this.roomName = this.structure.selectedRoom.name;
		this.roomIcon.icon = this.structure.selectedRoom.icon;
		this.groupRooms = this.structure.rooms.filter(roomFilter => roomFilter.useRoomAsGroup && roomFilter.ID !== this.structure.selectedRoom.ID);
		this.useRoomAsGroup = this.structure.selectedRoom.useRoomAsGroup ? true : false;
		const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> this.structure.selectedRoom.ID === el.ID));
		if(group.length > 0){
			this.roomToGroup = true;
			this.selectedGroup = {
				ID: group[0].ID,
				name: group[0].name
			};
		}else{
			this.roomToGroup = false;
			this.selectedGroup = {};
		}
	}

	private applyRoomChanges(){
		this.structure.rooms[this.structure.selectedRoom.ID].name = this.roomName;
		this.structure.rooms[this.structure.selectedRoom.ID].icon = this.roomIcon.icon;
		// check if room was moved out of group
		let outOfGroup = ()=>{
			const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> this.structure.selectedRoom.ID === el.ID));
			if(group.length > 0){
				this.structure.rooms[group[0].ID].groupRooms.splice(this.helper.find(this.structure.rooms[group[0].ID].groupRooms, 'ID', this.structure.selectedRoom.ID).index, 1);
			}
		}
		if(this.useRoomAsGroup){
			this.structure.rooms[this.structure.selectedRoom.ID]['useRoomAsGroup'] = true;
			if(!this.structure.rooms[this.structure.selectedRoom.ID]['groupRooms']){
				this.structure.rooms[this.structure.selectedRoom.ID]['groupRooms'] = [];
			}
		}else{
			if(this.structure.rooms[this.structure.selectedRoom.ID].useRoomAsGroup !== undefined){
				this.structure.rooms[this.structure.selectedRoom.ID].useRoomAsGroup = false;
				this.structure.rooms[this.structure.selectedRoom.ID]['groupRooms'] = [];
			}
		}
		if(!this.roomToGroup){
			outOfGroup();
		}
		else{
			outOfGroup();
			if(this.selectedGroup.name){
				// check if group already has rooms inside
				if(!this.structure.rooms[this.selectedGroup.ID]['groupRooms']){
					this.structure.rooms[this.selectedGroup.ID]['groupRooms'] = [];
				}
				this.structure.rooms[this.selectedGroup.ID]['groupRooms'].push({
					ID: this.structure.rooms[this.structure.selectedRoom.ID].ID,
					name: this.structure.rooms[this.structure.selectedRoom.ID].name
				});
			}
		}
	}

	private resetValues(){
		// reset values
		setTimeout(()=>{
			this.addEvent = '';
			this.editMode = false;
			this.useRoomAsGroup = false;
			this.roomToGroup = false;
			this.selectedGroup = {};
			this.roomIcon = {type: 'ion', icon: 'home'};
			this.roomName = '';
		}, 500);
	}

	ngOnDestroy(){
		this.editSub.unsubscribe();
	}
}
