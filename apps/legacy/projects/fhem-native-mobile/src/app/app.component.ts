import { Component, Output, EventEmitter, Type, NgZone } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

// Room Component
import { RoomComponent } from '@FhemNative/components/room/room.component';

// Services
import { TaskService } from '@FhemNative/services/task.service';
import { FhemService } from '@FhemNative/services/fhem.service';
import { StorageService } from '@FhemNative/services/storage.service';
import { VariableService } from '@FhemNative/services/variable.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { ThemeService } from '@FhemNative/services/theme/theme.service';
import { StructureService } from '@FhemNative/services/structure.service';
import { LoggerService } from '@FhemNative/services/logger/logger.service';
import { ComponentLoaderService } from '@FhemNative/services/component-loader.service';
import { NativeFunctionsChildService } from './services/native-functions.service';

// Interfaces
import { AppSetting, Room } from '@FhemNative/interfaces';

// Plugins
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
	constructor(
		private zone: NgZone,
		private task: TaskService,
		private fhem: FhemService,
		private platform: Platform,
		private theme: ThemeService,
		private logger: LoggerService,
		private storage: StorageService,
		public settings: SettingsService,
		private variable: VariableService,
		private structure: StructureService,
		private modalController: ModalController,
		private componentLoader: ComponentLoaderService,
		private nativeChild: NativeFunctionsChildService){
		// initialize
		this.initialzeApp();

		// app pause and resume
		App.addListener('appStateChange', ( {isActive} ) => this.zone.run(()=> {
			if(isActive){
				this.handleAppResume();
			}else{
				this.handleAppPause();
			}
		}));
	}

	private async initialzeApp(): Promise<void>{
		// initialize storage
		await this.storage.initStorage();

		// hide splash
		await this.platform.ready();
		SplashScreen.hide();

		// load room structure
		await this.structure.loadRooms(true, RoomComponent);
		// modify defaults before initial load
		this.settingsModifier();

		// Load App Defaults
		await this.settings.loadDefaults();
		this.logger.info('App Settings loaded');

		// init native-functions
		this.nativeChild.preloadAudio();

		// init theme --> dark is default
		if(this.settings.app.theme !== 'dark'){
			this.theme.changeTheme(this.settings.app.theme);
		}

		// initialize fhem
		const initialProfile = this.settings.connectionProfiles[0];
		if(initialProfile && initialProfile.IP !== ''){
			// connect fhem
			this.fhem.connectFhem();
		}
		// listen to variables
		this.variable.listen();
		// listen to tasks
		if(this.settings.app.showTasks){
			this.task.listen();
		}

		// check for status bar hide
		this.checkStatusBar();
	}

	// modify settings before initial load
	private settingsModifier(): void{
		const settings: Array<{name: string, newDefault: any}> = [
			{name: 'language', newDefault: 'de'}
		];

		settings.forEach((singleSetting: {name: string, newDefault: any})=>{
			let foundSetting: AppSetting|undefined = this.settings.appDefaults.find((x: AppSetting)=> x.name === singleSetting.name);
			if(foundSetting){
				foundSetting.default = singleSetting.newDefault;
			}
		});

		// add settings
		const newSettings: AppSetting[] = [
			// haptic feedback on events
			{name: 'hapticFeedback', default: JSON.stringify({enable: false, duration: 1}), toStorage: true},
			// acustic feedback on events
			{name: 'acusticFeedback', default: JSON.stringify({enable: false, audio: '1'}), toStorage: true},
			// share FhemNative config in FHEM Reading
			{name: 'sharedConfig', default: JSON.stringify({enable: false, passive: false, device: '', reading: ''}), toStorage: true},
			// full screen
			{name: 'showStatusBar', default: true, toStorage: true}
		];
		this.settings.appDefaults = this.settings.appDefaults.concat(newSettings);
	}

	// App events
	private handleAppResume(): void{
		this.fhem.tries = 0;
		this.fhem.noReconnect = false;

		// initialize fhem
		const initialProfile = this.settings.connectionProfiles[0];
		if(!this.fhem.connected && initialProfile && initialProfile.IP !== ''){
			this.fhem.connectFhem();
		}
		// listen to tasks
		if(this.settings.app.showTasks){
			this.task.listen();
		}
		// listen to variables
		this.variable.listen();

		// reenter the route
		if(!this.settings.blockRoomReload){
			let room: Room;
			if(this.structure.currentRoom){
				room = this.structure.currentRoom;
			}else{
				room = this.structure.rooms[0];
			}
			// clear container before rerender
			if(this.componentLoader.currentContainer){
				this.componentLoader.clearContainer(this.componentLoader.currentContainer, true);
			}

			this.structure.navigateToRoom(room.name, room.ID, { 
				name: room.name, ID: room.ID, 
				UID: room.UID, reload: true,
				reloadID: this.settings.getUID()
			});
		}
	}

	private handleAppPause(): void{
		if(!this.settings.app.keepConnected){
			this.fhem.noReconnect = true;
 		}
 		this.variable.unlisten();
	}

	// check for status bar hide
	private async checkStatusBar(): Promise<void>{
		if(this.settings.operatingPlatform === 'mobile' && !this.settings.app.showStatusBar){
			await StatusBar.hide();
		}
	}

	// load dynamic component
	private loadDynamicComponent(path: string): Promise<Type<any>>{
		return new Promise((resolve)=>{
			const prefix: string = 'components/';
			import(`./${ prefix + path}.component`).then((componentData: any)=>{
				const comp: string = Object.keys(componentData)[0];
				const ComponentType: Type<any> = componentData[comp];
				resolve(ComponentType);
			});
		});
	}
	
	// core settings wrapper
	async openSettings(): Promise<void>{
		const comp: Type<any> = await this.loadDynamicComponent('settings/settings');
		const modal = await this.modalController.create({
			component: comp,
			backdropDismiss: false,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
	}
}
