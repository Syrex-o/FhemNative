import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Platform, MenuController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Drag and Drop
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Services
import { LoggerService } from './services/logger/logger.service';
import { FhemService } from './services/fhem.service';
import { UndoRedoService } from './services/undo-redo.service';
import { SettingsService } from './services/settings.service';
import { StructureService } from './services/structure.service';
import { VersionService } from './services/version.service';
import { TaskService } from './services/task.service';
import { VariableService } from './services/variable.service';
import { ComponentLoaderService } from './services/component-loader.service';

// Room Component
import { RoomComponent } from './components/room/room.component';

// Animation
import { menuStagger } from './animations/animations';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [menuStagger]
})
export class AppComponent {
	// Ionic menu state
	menuState: boolean = false;

  	constructor(
    	private platform: Platform,
    	private menu: MenuController,
    	private modalController: ModalController,
    	private splashScreen: SplashScreen,
    	private statusBar: StatusBar,
    	private version: VersionService,
    	public settings: SettingsService,
    	public structure: StructureService,
    	public task: TaskService,
    	private variable: VariableService,
    	private fhem: FhemService,
    	private logger: LoggerService,
    	private undoManager: UndoRedoService,
    	private componentLoader: ComponentLoaderService) {
  		// variables
		this.variable.listen();
  		// load room structure
		this.structure.loadRooms(true, RoomComponent);

    	this.initializeApp();
    	// load app App Defaults
		settings.loadDefaults().then(()=>{
			this.logger.info('App Settings loaded');
			// initialize fhem
			if(this.settings.connectionProfiles[0].IP !== ''){
				this.fhem.connectFhem();
			}
			// listen to tasks
			if(this.settings.app.showTasks){
				this.task.listen();
			}
			// check for desktop resizing
			if(this.settings.app.customWindowScale.enable){
				this.logger.info('Rescaling window');
				this.settings.scaleWindow();
			}
		});
  	}

  	initializeApp() {
    	this.platform.ready().then(() => {
    		this.logger.info('FhemNative fully loaded');
      		this.statusBar.styleDefault();
      		this.splashScreen.hide();
    	});
  	}

  	// switch room
	switchRoom(name: string, ID: number, reload?: boolean){
		this.logger.info('Switch room to: ' + name);

		const roomToSwitch = this.structure.rooms.find(x=> x.ID === ID);
		this.structure.navigateToRoom(name, ID, {
			name: name,
			ID: ID,
			UID: roomToSwitch.UID,
			reload: reload || false
		});
		this.menu.close();
	}

	// show submenu items
	toggleSubMenu(event){
		event.target.parentNode.parentNode.classList.toggle('show-submenu');
	}

	// edit button
	edit(){
		// tell the indicator, that editing was triggered from room with ID
		this.settings.modeSub.next({
			roomEdit: true,
			roomEditFrom: this.structure.currentRoom.ID
		});
	}

	// Edit specific room
	editRoom(ID: number) {
		this.logger.info('Editing room: ' + this.structure.rooms[ID].name);
		this.componentLoader.createSingleComponent('CreateEditRoomComponent', this.componentLoader.containerStack[0].container, {
			type: 'edit',
			ID: ID
		});
		this.menu.close();
	}

	// remove room
	removeRoom(ID) {
		const room = JSON.parse(JSON.stringify(this.structure.rooms[ID]));
		this.structure.rooms.splice(ID, 1);
		this.logger.info('Removed room: ' + room.name);
		// check if group room was deleted and current route is in group room
		const inGroup: boolean = room.groupRooms && room.groupRooms.find(el => el.ID === this.structure.currentRoom.ID) ? true : false;
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
	drop(event: CdkDragDrop<string[]>, subMenu: any) {
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
				const currentIndex = group.findIndex(x => x.ID === this.structure.currentRoom.ID);
				// check if item in submenu was moved and is current room
				if(currentIndex > -1 && ( event.previousIndex === currentIndex || event.currentIndex === 0 )){
					this.switchRoom(group[0].name, group[0].ID, true);
				}
			}
		}
	}

  	async openSettings() {
  		this.logger.info('Switch room to: Settings');
  		this.menu.close();

  		let comp;
  		await this.componentLoader.loadDynamicComponent('settings/settings', false).then((ComponentType: any)=>{
  			comp = ComponentType;
  		});

		const modal = await this.modalController.create({
			component: comp,
			backdropDismiss: false,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
	}

  	async openTasks(){
  		this.logger.info('Switch room to: Tasks');
  		this.menu.close();

  		let comp;
  		await this.componentLoader.loadDynamicComponent('tasks/tasks', false).then((ComponentType: any)=>{
  			comp = ComponentType;
  		});

  		const modal = await this.modalController.create({
			component: comp,
			backdropDismiss: false,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
  	}

  	async openVariables(){
  		this.logger.info('Switch room to: Variables');
  		this.menu.close();

  		let comp;
  		await this.componentLoader.loadDynamicComponent('variables/variables', false).then((ComponentType: any)=>{
  			comp = ComponentType;
  		});

  		const modal = await this.modalController.create({
			component: comp,
			backdropDismiss: false,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
  	}
}