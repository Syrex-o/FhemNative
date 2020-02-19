import { Component, OnDestroy, ViewChild, ViewContainerRef, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { FhemService } from '../../services/fhem.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { TasksService } from '../../services/tasks.service';
import { CreateComponentService } from '../../services/create-component.service';
import { SelectComponentService } from '../../services/select-component.service';

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
		            <ion-icon class="edit" name="md-create"></ion-icon>
		        </button>
			</ion-toolbar>
		</ion-header>
		<button-container [moveToRight]="true"></button-container>
		<create-room *ngIf="settings.modes.roomEdit"></create-room>
		<div [ngClass]="settings.app.theme" class="content" [attr.id]="'room_'+structure.currentRoom.ID">
			<ng-container class="container" #container></ng-container>
			<button *ngIf="settings.modes.roomEdit" matRipple [matRippleColor]="'#d4d4d480'" class="add-btn btn-round" (click)="createComponentMenu()">
				<span class="line top"></span>
				<span class="line bottom"></span>
			</button>
		</div>
	`,
	styles: [`
		ion-header.ios{
			height: 60px;
		}
		ion-toolbar.ios{
			--min-height: 56px;
		}
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
		.add-btn{
			position: fixed;
		    bottom: 8px;
		    right: 8px;
		    margin-right: 0px;
		}
		.add-btn .line{
			position: absolute;
			left: 50%;
			top: 50%;
			width: 60%;
			height: 5px;
			background: var(--gradient);
			border-radius: 5px;
			transition: all .3s ease;
		}
		.line.top{
			transform: translate3d(-50%, -50%,0);
		}
		.line.bottom{
			transform: translate3d(-50%, -50%,0) rotate(90deg);
		}
		.add-btn:hover .line.top{
			transform: translate3d(-50%, -50%,0) rotate(90deg);
		}
		.add-btn:hover .line.bottom{
			transform: translate3d(-50%, -50%,0) rotate(180deg);
		}

		.btn-round .edit{
			color: var(--btn-blue);
			left: 50%;
		    position: absolute;
		    top: 50%;
		    transform: translate(-50%, -50%);
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
		private selectComponent: SelectComponentService,
		private zone: NgZone,
		private route: ActivatedRoute,
		private task: TasksService) {
		// App Pause / Resume
			this.onPauseSubscription = this.platform.pause.subscribe(() => {
				this.fhem.noReconnect = true;
				this.createComponent.clearContainer(this.container);
				this.fhem.disconnect();
			});
			this.onResumeSubscription = this.platform.resume.subscribe(() => {
				if(!this.settings.modes.blockDefaultLoader){
					this.fhem.noReconnect = false;
					this.fhem.connectFhem().then((e)=>{
						// listen to tasks
						if(this.settings.app.showTasks){
							this.task.listen();
						}
					});
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

	// create component menu
	public createComponentMenu(){
		this.createComponent.createSingleComponent('CreateEditComponentComponent', this.container, {
			container: this.container,
			type: 'create'
		});
	}

	private createHelpers() {
		if(this.structure.canEdit(this.structure.getCurrentRoom().item.ID)){
			this.createComponent.createSingleComponent('GridComponent', this.container, {container: this.container});
		}else{
			this.removeHelpers();
		}
	}

	private removeHelpers() {
		this.createComponent.removeSingleComponent('GridComponent', this.container);
	}

	private loadRoomComponents() {
		this.zone.run(()=>{
			// filling current room in structure
			this.structure.currentRoom = this.structure.getCurrentRoom().item;
			// filling the current components container
			this.createComponent.currentRoomContainer = this.container;
			// loading the room components
			this.createComponent.loadRoomComponents(this.structure.currentRoom.components, this.container, true);
			// create helpers, if needed
			if (this.settings.modes.roomEdit) {
				this.createHelpers();
			}
			// clear selection list 
			this.selectComponent.selectorList = [];
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
