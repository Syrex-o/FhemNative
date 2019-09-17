import { Component } from '@angular/core';
import { RoomComponent } from '../room/room.component';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';

@Component({
	selector: 'create-room',
	template: `
	<div class="create-container room" [ngClass]="settings.app.theme">
		<button matRipple [matRippleColor]="'#d4d4d480'" class="add-btn" (click)="this.editMode = true;">
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
				placeholder="roomIcon"
				[(ngModel)]="roomIcon">
				<ng-template ng-option-tmp let-item="item" let-index="index">
				    <ion-icon [name]="item"></ion-icon>
				    <span class="label">{{item}}</span>
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
	public roomIcon = 'home';

	constructor(
		private structure: StructureService,
		public settings: SettingsService,
		private createComponent: CreateComponentService) {

	}

	public saveRoom(room) {
		if (room) {
			this.structure.rooms.push(
				{
					ID: this.structure.rooms.length,
					name: room,
					icon: this.roomIcon,
					components: []
				}
			);
			this.addEvent = 'room-added';
			this.structure.saveRooms().then(() => {
				this.structure.resetRouter(RoomComponent);
				setTimeout(() => {
					// reset values
					this.addEvent = '';
					this.editMode = false;
					this.roomIcon = 'home';
					this.roomName = '';
				}, 1000);
			});
		} else {
			this.addEvent = 'room-error';
		}
	}
}
