import { Component, OnDestroy, ViewChild, ViewContainerRef, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { FhemService } from '../../services/fhem.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'room',
	template: `
		<ion-header [ngClass]="settings.app.theme">
			<ion-toolbar>
				<ion-buttons slot="start">
				<ion-menu-button></ion-menu-button>
				</ion-buttons>
				<ion-title>{{structure.currentRoom.name}}</ion-title>
				<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" *ngIf="!settings.modes.roomEdit && settings.app.enableEditing" (click)="edit()">
		            <ion-icon class="edit" name="create"></ion-icon>
		        </button>
			</ion-toolbar>
		</ion-header>
		<button-container [moveToRight]="true"></button-container>
		<create-room *ngIf="settings.modes.roomEdit"></create-room>
		<div [ngClass]="settings.app.theme" class="content" [attr.id]="'room_'+structure.currentRoom.ID">
			<ng-container class="container" #container></ng-container>
		</div>
	`,
	styles: [`
		ion-title{
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
		}
		.content{
			position: relative;
			height: 100%;
			width: 100%;
			overflow-y: auto;
			overflow-x: hidden;
		}
		.container{
			width: inherit;
			height: inherit;
		}
		button:focus{
			outline: 0px;
		}
		.btn-round{
			position: relative;
			float: right;
			margin-right: 16px;
			width: 45px;
		    height: 45px;
		    border-radius: 50%;
		    border: none;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		    z-index: 100;
		    font-size: 25px;
		}

		.btn-round .edit{
			color: var(--btn-blue);
		}

		.dark.content,
		.dark .add-btn,
		.dark .btn-round{
			background: var(--dark-bg);
		}
		.dark ion-toolbar{
			--background: var(--dark-bg);
		}
		.dark ion-title,
		.dark ion-menu-button{
			--color: var(--dark-p);
		}
	`]
})
export class RoomComponent implements OnDestroy {
	@ViewChild('container', { static: true, read: ViewContainerRef }) container: ViewContainerRef;
	// app pause and resume handlers
	private onResumeSubscription: Subscription;
	private onPauseSubscription: Subscription;
	private routeSub: Subscription;
	private editSub: Subscription;

	constructor(
		private fhem: FhemService,
		public structure: StructureService,
		public settings: SettingsService,
		private platform: Platform,
		private createComponent: CreateComponentService,
		private zone: NgZone,
		private route: ActivatedRoute) {
		// App Pause / Resume
			this.onPauseSubscription = this.platform.pause.subscribe(() => {
				this.fhem.noReconnect = true;
				this.createComponent.clearContainer(this.container);
				this.fhem.disconnect();
			});
			this.onResumeSubscription = this.platform.resume.subscribe(() => {
				if(!this.settings.modes.blockDefaultLoader){
					this.fhem.noReconnect = false;
					this.fhem.connectFhem();
					this.loadRoomComponents();
				}
			});
			// subscribe to route change
			this.routeSub = route.params.subscribe(val => {
	    		this.loadRoomComponents();
	  		});
	  		// subscribe to room Changes
	  		this.editSub = this.settings.modeSub.subscribe(next =>{
	  			if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
					if(this.settings.modes.roomEdit){
						// edit mode
						this.createHelpers();
					}else{
						// finish edit mode
						this.removeHelpers();
					}
				}
	  		});
	}

	public edit(){
		// tell the indicator, that editing was triggered from room with ID
		this.settings.modeSub.next({
			roomEdit: true,
			roomEditFrom: this.structure.getCurrentRoom().item.ID
		});
	}

	private createHelpers() {
		if(this.structure.canEdit(this.structure.getCurrentRoom().item.ID)){
			this.createComponent.createSingleComponent('GridComponent', this.container, {container: this.container});
			this.createComponent.createSingleComponent('CreateComponentComponent', this.container, {container: this.container});
		}else{
			this.removeHelpers();
		}
	}

	private removeHelpers() {
		this.createComponent.removeSingleComponent('GridComponent', this.container);
		this.createComponent.removeSingleComponent('CreateComponentComponent', this.container);
	}

	private loadRoomComponents() {
		this.zone.run(()=>{
			// filling current room in structure
			this.structure.currentRoom = this.structure.getCurrentRoom().item;
			// filling the current components container
			this.createComponent.currentRoomContainer = this.container;
			// loading the room components
			this.createComponent.loadRoomComponents(this.structure.currentRoom.components, this.container, true);

			if (this.settings.modes.roomEdit) {
				this.createHelpers();
			}
		});
	}

	ngOnDestroy() {
		this.removeHelpers();
		// unsubscribe events
		this.onPauseSubscription.unsubscribe();
		this.onResumeSubscription.unsubscribe();
		this.routeSub.unsubscribe();
		this.editSub.unsubscribe();
	}
}
