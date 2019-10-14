import { Component } from '@angular/core';
import { RoomComponent } from '../room/room.component';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { CreateComponentService } from '../../services/create-component.service';

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
		[headLine]="'GENERAL.CREATE_ROOM.TITLE' | translate"
		[popupHeight]="'60%'"
		[fixPosition]="true"
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
			<button ion-button class="btn submit" (click)="this.saveRoom(roomName)">{{'GENERAL.BUTTONS.SAVE' | translate}}</button>
			<button ion-button class="btn cancel" (click)="this.editMode = false;">{{'GENERAL.BUTTONS.CANCEL' | translate}}</button>
			<p class="error-message" *ngIf="addEvent == 'room-error'">{{'GENERAL.CREATE_ROOM.NO_ROOM_NAME' | translate}}</p>
			<p class="success-message" *ngIf="addEvent == 'room-added'">{{'GENERAL.CREATE_ROOM.ROOM_CREATED' | translate}}</p>
		</div>
	</popup>
	`,
	styleUrls: ['./create-style.scss']
})
export class CreateRoomComponent {
	public editMode = false;
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
		private helper: HelperService) {
	}

	public openMenu(){
		this.editMode = true;
		this.groupRooms = this.structure.rooms.filter(room => room.useRoomAsGroup);
	}

	public saveRoom(room) {
		if (room) {
			this.structure.rooms.push(
				{
					ID: this.structure.rooms.length,
					name: room,
					icon: this.roomIcon.icon,
					components: []
				}
			);
			if(this.useRoomAsGroup){
				this.structure.rooms[this.structure.rooms.length -1]['useRoomAsGroup'] = true;
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
			this.structure.saveRooms().then(() => {
				this.structure.resetRouter(RoomComponent);
				setTimeout(() => {
					// reset values
					this.addEvent = '';
					this.editMode = false;
					this.roomIcon = {type: 'ion', icon: 'home'};
					this.roomName = '';
				}, 1000);
			});
		} else {
			this.addEvent = 'room-error';
		}
		this.useRoomAsGroup = false;
		this.roomToGroup = false;
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

}
