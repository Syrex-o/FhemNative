import { Component, OnDestroy, ViewChild, ViewContainerRef, NgZone, Input } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// Services
import { FhemService } from '../../services/fhem.service';
import { TaskService } from '../../services/task.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

@Component({
  	selector: 'room',
  	templateUrl: './room.component.html',
  	styleUrls: ['./room.component.scss']
})

export class RoomComponent implements OnDestroy {
	// room container
	@ViewChild('container', { static: true, read: ViewContainerRef }) container: ViewContainerRef;
	// Navigation Change
	private routeSub: Subscription;
	// edit change
	private editSub: Subscription;
	// app pause and resume handlers
	private onResumeSubscription: Subscription;
	private onPauseSubscription: Subscription;

	constructor(
		public settings: SettingsService,
		public structure: StructureService,
		private componentLoader: ComponentLoaderService,
		private route: ActivatedRoute,
		private platform: Platform,
		private task: TaskService,
		private fhem: FhemService,
		private zone: NgZone){

		// subscribe to route change
		this.routeSub = route.queryParams.subscribe(params => {
			// get the current room on route change
			if(params){
				if(this.structure.currentRoom){
					// determine real route change or reload needed
					if(params.UID !== this.structure.currentRoom.UID || params.reload){
						this.initRoom(params);
					}
				}else{
					// initially loaded
					this.initRoom(params);
				}
			}
		});
		// subscribe to room edit Changes
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
	  	// App pause/resume
	  	this.onPauseSubscription = this.platform.pause.subscribe(() => {
	  		// check for always on
	  		if(!this.settings.app.keepConnected){
	  			this.fhem.noReconnect = true;
	  			this.fhem.disconnect();
	  		}
	  	});
	  	this.onResumeSubscription = this.platform.resume.subscribe(() => {
	  		if(!this.fhem.connected){
	  			this.fhem.noReconnect = false;
	  			this.fhem.connectFhem();
	  			// listen to tasks
				if(this.settings.app.showTasks){
					this.task.listen();
				}
				if(this.settings.modes.roomEdit){
					// edit mode
					this.createHelpers();
				}
	  		}
	  		this.initRoom();

	  	});
	}

	private initRoom(params?: any){
		if(params){
			// filling current room in structure
			this.structure.getCurrentRoom(params.ID);
		}else{
			this.structure.getCurrentRoom(this.structure.currentRoom.ID);
		}
		// filling the current components container
		this.componentLoader.currentContainerSub.next({
			ID: this.structure.currentRoom.ID,
			action: 'initial',
			container: this.container
		});
		// load the room components
		this.loadRoomComponents();
		// detect switch room while editing
		if(this.settings.modes.roomEdit){
			this.edit();
		}
	}

	edit(){
		// tell the indicator, that editing was triggered from room with ID
		this.settings.modeSub.next({
			roomEdit: true,
			roomEditFrom: this.structure.currentRoom.ID
		});
	}

	// create help menu
	private createHelpers() {
		if(this.structure.canEditContainer(this.structure.currentRoom.ID)){
			this.componentLoader.createSingleComponent('GridComponent', this.container, {
				container: this.container
			});
		}else{
			this.removeHelpers();
		}
	}

	// remove help menu
	private removeHelpers(){
		this.componentLoader.removeDynamicComponent('GridComponent');
	}

	private loadRoomComponents(){
		this.zone.run(()=>{
			this.componentLoader.loadRoomComponents(this.structure.currentRoom.components, this.container, true);
		});
	}

	// create the menu, to create components
	createComponentMenu(){
		this.componentLoader.createSingleComponent('CreateEditComponent', this.container, {
			container: this.componentLoader.currentContainer,
			type: 'create'
		});
	}

	ngOnDestroy() {
		// Unsubscribe Events
		this.routeSub.unsubscribe();
		this.editSub.unsubscribe();
	}
}