import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, NgZone } from '@angular/core';
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
		<ion-header [ngClass]="settings.app.theme" long-press duration="1000" (onLongPress)="edit()">
			<ion-toolbar>
				<ion-buttons slot="start">
				<ion-menu-button></ion-menu-button>
				</ion-buttons>
				<ion-title>{{structure.currentRoom.name}}</ion-title>
			</ion-toolbar>
			<create-room *ngIf="settings.modes.roomEdit"></create-room>
		</ion-header>
		<div [ngClass]="settings.app.theme" class="content" long-press [attr.id]="'room_'+structure.currentRoom.ID">
			<button matRipple [matRippleColor]="'#d4d4d480'" class="save-options" *ngIf="settings.modes.roomEdit" (click)="finishEdit()">
				<ion-icon class="save-icon" name="checkmark-circle-outline"></ion-icon>
			</button>
			<ng-container class="container" #container></ng-container>
		</div>
	`,
	styles: [`
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
		.save-options{
			position: fixed;
			top: 5px;
			z-index: 20004;
		}
		.save-options{
			right: 70px;
		}

		.save-icon{
			transform: scale3d(3,3,3);
			color: var(--btn-blue);
		}
		.save-options{
			width: 45px;
			height: 45px;
			border-radius: 50%;
			background: #ffffff;
			border: none;
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		}
		button:focus{
			outline: 0px;
		}

		.dark.content,
		.dark .add-btn,
		.dark .save-options{
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
export class RoomComponent implements OnInit, OnDestroy {
	@ViewChild('container', { static: true, read: ViewContainerRef }) container: ViewContainerRef;
	// app pause and resume handlers
	private onResumeSubscription: Subscription;
	private onPauseSubscription: Subscription;
	private routeSub: Subscription;

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

		this.routeSub = route.params.subscribe(val => {
	    	this.loadRoomComponents();
	  	});
	}

	ngOnInit() {
		// this.loadRoomComponents();
	}

	public edit() {
		this.settings.modeSub.next({roomEdit: true});
		this.createHelpers();
	}

	private createHelpers() {
		this.createComponent.createSingleComponent('GridComponent', this.container, {container: this.container});
		this.createComponent.createSingleComponent('CreateComponentComponent', this.container, {container: this.container});
	}

	private removeHelpers() {
		this.createComponent.removeSingleComponent('GridComponent', this.container);
		this.createComponent.removeSingleComponent('CreateComponentComponent', this.container);
	}

	public finishEdit() {
		this.settings.modeSub.next({roomEdit: false});
		this.removeHelpers();
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
		this.onPauseSubscription.unsubscribe();
		this.onResumeSubscription.unsubscribe();
		this.routeSub.unsubscribe();
	}
}
