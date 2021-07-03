import { Component, NgModule, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

// Components
import { RoomHeaderModule } from './header/header.component';
import { MenuButtonContainerModule } from '../menu-button-container/menu-button-container.component';

// Directives
import { GrouperModule } from '@FhemNative/directives/grouper.directive';

// Services
import { TaskService } from '@FhemNative/services/task.service';
import { FhemService } from '@FhemNative/services/fhem.service';
import { LoggerService } from '@FhemNative/services/logger/logger.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { VariableService } from '@FhemNative/services/variable.service';
import { StructureService } from '@FhemNative/services/structure.service';
import { SelectComponentService } from '@FhemNative/services/select-component.service';
import { ComponentLoaderService } from '@FhemNative/services/component-loader.service';

// Interfaces
import { Room, RoomParams } from '../../interfaces/interfaces.type';

@Component({
	selector: 'room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnDestroy {
	// room container
	@ViewChild('container', { static: false, read: ViewContainerRef }) container!: ViewContainerRef;
	// Subscriptions
	// Navigation Change
	private routeSub!: Subscription;
	// edit change
	private editSub!: Subscription;
	// shared config sub
	private sharedConfigSub!: Subscription;

	constructor(
		private fhem: FhemService,
		private task: TaskService,
		private route: ActivatedRoute,
		private logger: LoggerService,
		private cdr: ChangeDetectorRef,
		public settings: SettingsService,
		private variable: VariableService,
		public structure: StructureService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
		// subscribe to route change
		this.routeSub = route.queryParams.subscribe((params: Params) => this.handleRouteSub(params) );
		// subscribe to room edit Changes
		this.editSub = this.settings.modeSub.subscribe(next => this.handleEditSub(next) );
		// listen to shared config
		this.sharedConfigSub = this.fhem.sharedConfigUpdateSub.subscribe((next: Room[])=>{ this.handleSharedConfigSub(next) });
	}

	// handle route subscription
	private handleRouteSub(params: Params): void {
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
	}

	// handle edit sub
	private handleEditSub(update: any): void {
		if(update.hasOwnProperty('roomEdit') || update.hasOwnProperty('roomEditFrom')){
			if(this.settings.modes.roomEdit){
				// edit mode
				this.createHelpers();
			}else{
				// finish edit mode
				this.removeHelpers();
			}
		}
	}

	// handle shared config updates
	private async handleSharedConfigSub(rooms: Room[]): Promise<void> {
		const shouldUpdate: boolean = await this.compareSharedConfig(rooms);
		if(shouldUpdate){
			this.structure.rooms = rooms;
			this.structure.getStructuredRoomList();
			// init room, when shared config targets current room
			if(rooms.find(x=> x.ID === this.structure.currentRoom.ID)){
				this.initRoom();
			}
		}
	}

	// compare configs
	// returns wheather to update current room config or not (true: update, false: not update)
	private compareSharedConfig(rooms: Room[]): Promise<boolean>{
		return new Promise((resolve)=>{
			// get current miniConf
			this.componentLoader.getMinifiedConfig().then((miniConf: Room[])=>{
				// compare configs
				if( !(JSON.stringify(miniConf) === JSON.stringify(rooms)) ){
					this.logger.info('Received new shared config. Updating rooms now.');
					resolve(true);
				}else{
					this.logger.info('Received identical shared config. No update needed.');
					resolve(false);
				}
			});
		});
	}

	// initialize room
	private initRoom(params?: Params): void{
		// reset selector list
		this.selectComponent.selectorList = [];
		// check for params
		if(params && 'ID' in params){
			// filling current room in structure
			this.structure.getCurrentRoom(params.ID);
		}else{
			if(this.structure.currentRoom){
				this.structure.getCurrentRoom(this.structure.currentRoom.ID);
			}else{
				// fallback to first/initial room
				this.structure.getCurrentRoom(this.structure.rooms[0].ID);
			}
		}

		// wait for init of container
		if(!this.container){
			setTimeout(()=>{
				this.loadRoomComponents();
			}, 0);
		}else{
			this.loadRoomComponents();
		}
	}

	createComponentMenu(): void{
		this.componentLoader.createSingleComponent('CreateEditComponent', this.container, {
			container: this.componentLoader.currentContainer,
			type: 'create'
		});
	}

	// create help menu
	private createHelpers(): void {
		if(this.structure.canEditContainer(this.structure.currentRoom.ID)){
			if(!this.container){
				setTimeout(()=>{
					this.componentLoader.createSingleComponent('GridComponent', this.container, { container: this.container });
				});
			}else{
				this.componentLoader.createSingleComponent('GridComponent', this.container, { container: this.container });
			}
		}else{
			this.removeHelpers();
		}
	}

	// remove help menu
	private removeHelpers(): void {
		this.componentLoader.removeDynamicComponent('GridComponent');
	}

	private async loadRoomComponents(): Promise<void>{
		// filling the current components container
		// indicating initial container --> remove container stack
		this.componentLoader.currentContainerSub.next({ ID: this.structure.currentRoom.ID, action: 'initial', container: this.container });
		await this.componentLoader.loadRoomComponents(this.structure.currentRoom.components, this.container, true);

		// detect switch room while editing
		if(this.settings.modes.roomEdit){
			// tell the indicator, that editing was triggered from room with ID
			this.settings.modeSub.next({ roomEdit: true, roomEditFrom: this.structure.currentRoom.ID });
			// trigger grouper
			setTimeout(()=>{ this.selectComponent.groupHandler.next(true); });
		}
		// run change detection, after everything should be positioned
		this.cdr.detectChanges();
	}

	ngOnDestroy() {
		// Unsubscribe Events
		this.routeSub.unsubscribe();
		this.editSub.unsubscribe();
		this.sharedConfigSub.unsubscribe();
	}
}

@NgModule({
	declarations: [ RoomComponent ],
	imports: [ 
		IonicModule,
		CommonModule,
		GrouperModule,
		RoomHeaderModule,
		MenuButtonContainerModule
	],
	exports: [ RoomComponent ]
})
export class RoomModule { }