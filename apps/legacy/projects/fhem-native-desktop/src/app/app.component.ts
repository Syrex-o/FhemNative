import { Component, Output, EventEmitter, Type } from '@angular/core';
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

// App
import { SettingsChildService } from './services/settings.service';

// Interfaces
import { AppSetting, Room } from '@FhemNative/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
	constructor(
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
		private childSettings: SettingsChildService,
		private componentLoader: ComponentLoaderService){
		// set operation platform to desktop
		this.settings.operatingPlatform = 'desktop';
		// initialize
		this.initialzeApp();
	}

	private async initialzeApp(): Promise<void>{
		// initialize storage
		await this.storage.initStorage();

		// load room structure
		await this.structure.loadRooms(true, RoomComponent);
		// modify defaults before initial load
		this.settingsModifier();

		// Load App Defaults
		await this.settings.loadDefaults();
		this.logger.info('App Settings loaded');

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
		// check for device resize
		this.checkDeviceSize();
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
			// share FhemNative config in FHEM Reading
			{name: 'sharedConfig', default: JSON.stringify({enable: false, device: '', reading: ''}), toStorage: true},
			// custom window size
			{name: 'customWindowScale', default: JSON.stringify({enable: false, deviceSelection: '', custom: false, dimensions: {width: 0, height: 0}}), toStorage: true}
		];
		this.settings.appDefaults = this.settings.appDefaults.concat(newSettings);
	}

	private checkDeviceSize(): void{
		if(this.settings.app.customWindowScale.enable){
			this.childSettings.scaleWindow();
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
