import { Component, OnInit, NgModule, Input, Output, EventEmitter, Inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Components
import { IonicModule, ModalController } from '@ionic/angular';
import { NewsSlideModule } from '@FhemNative/directives/news-slide.directive';
import { SelectComponentModule } from '@FhemNative/components/select/select.component';
import { PickerComponentModule } from '@FhemNative/components/picker/picker.component';
import { SwitchComponentModule } from '@FhemNative/components/switch/switch.component';

// Serivces
import { TaskService } from '../../services/task.service';
import { FhemService } from '../../services/fhem.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme/theme.service';
import { LoggerService } from '../../services/logger/logger.service';
import { StructureService } from '../../services/structure.service';
import { BackButtonService } from '../../services/back-button.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

// Interfaces
import { FhemDevice, Room, DynamicComponent, DynamicComponentDefinition } from '../../interfaces/interfaces.type';

// animations
import { ShowHide } from '../../animations/animations';

@Component({
	selector: 'core-settings',
	templateUrl: './core-settings.component.html',
	styleUrls: ['./core-settings.component.scss'],
	animations: [ ShowHide ]
})

export class CoreSettingsComponent implements OnInit{
	// Back button handle ID
	private handleID: string = this.settings.getUID();
	// menu for fhemnative import/export
	@Input() showExportImportMenu: boolean = true;
	// allow custom theme
	@Input() showCustomThemeOption: boolean = true;
	// Show Undo Redo Options
	@Input() showUndoRedoOption: boolean = true;
	// show task menu activation option
	@Input() showTasksOption: boolean = true;
	// show logger
	@Input() showLoggerOption: boolean = true;
	// show changelog menu
	@Input() showChangelogOption: boolean = true;
	// show support buttons
	@Input() showSupportOptions: boolean = true;
	// show advandec menu and options
	@Input() showAdvancedOptions: boolean = true;
	// show keep connection option --> irrelevant for desktop
	@Input() showKeepConnectionOption: boolean = true;

	// Outputs
	@Output() onWebsiteClick: EventEmitter<boolean> = new EventEmitter();
	@Output() onPrivacyClick: EventEmitter<boolean> = new EventEmitter();

	// picker states
	menus: {[key: string]: boolean} = {
		customAppTheme: false,
		changeLog: false,
		thirdParty: false,
		advanced: false,
		sharedConfig: false
	};
	// device sizes for rescale
	devices: Array<{device: string, dimensions: {width: number, height: number}}> = [];
	// changelog data
	changelog!: any;

	constructor(
		private http: HttpClient,
		public fhem: FhemService,
		private task: TaskService,
		private toast: ToastService,
		private theme: ThemeService,
		private logger: LoggerService,
		private storage: StorageService,
		public settings: SettingsService,
		private backBtn: BackButtonService,
		public translate: TranslateService,
		private modalCtrl: ModalController,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService,
		@Inject(DOCUMENT) private document: Document){
	}

	ngOnInit(){
		this.backBtn.handle(this.handleID, ()=>{
			this.closeSettings();
		});
	}

	// close settings menu
	closeSettings(): void{
		this.modalCtrl.dismiss();
		this.backBtn.removeHandle(this.handleID);
	}

	// edit websocket settings
	toggleConnectionSettings(): void{
		this.settings.modes.fhemMenuMode = '';
		setTimeout(()=>{
			this.settings.modes.fhemMenuMode = 'ip-config';
		}, 0);
		this.closeSettings();
	}

	// share fhemnative config in fhem device reading
	// toggle menu
	// settings before
	private initialSettingsSharedConfig: any;
	// JSON.parse(JSON.stringify(this.settings.app.sharedConfig));
	toggleSharedConfig(): void{
		this.initialSettingsSharedConfig = JSON.parse(JSON.stringify(this.settings.app.sharedConfig));
		this.menus.sharedConfig = true;
		this.testSharedConfig();
	}

	// Ionic component called change --> extract value
	changeAppSettingFromIon(setting: string, event: any): void{
		this.changeAppSetting(setting, event.detail.value);
	}

	// change app setting
	changeAppSetting(setting: string, value: any): void{
		this.storage.changeSetting({name: setting, change: value}).then((res) => {this.settings.app[setting] = res; });
	}

	// Ionic component called change --> extract value
	changeAppSettingJSONFromIon(setting: string, jsonProp: string, event: any): void{
		this.changeAppSettingJSON(setting, jsonProp, event.detail.value);
	}

	// change JSON app setting
	changeAppSettingJSON(setting: string, jsonProp: string, value: any){
		this.settings.app[setting][jsonProp] = value;
		this.storage.changeSetting({name: setting, change: JSON.stringify(this.settings.app[setting])}).then((res) => {
			this.settings.app[setting] = res;
		});
	}

	// change app theme
	changeAppTheme(event: any): void{
		const theme: string = event.detail.value;
		this.changeAppSetting('theme', theme);
		this.theme.changeTheme(theme);
	}

	// play audio
	playAudio(event: any): void{
		// this.native.playAudio(event.detail.value);
	}

	// share settings
	share(): void {
		this.storage.getAllSettings().then((res: any) => {
			// mobile fallback to display for copy
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_MOBILE_TITLE'),
				this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_MOBILE_INFO'),
				{
					inputs: [{
						name: 'mobile-for-copy',
						type: 'textarea',
						value: JSON.stringify(res)
					}],
					buttons: [{text: this.translate.instant('GENERAL.BUTTONS.CLOSE'), role: 'cancel'}]
				}
			);
		});
	}

	// share log file
	showLog(): void{
		let log: string = '';
		this.settings.log.forEach((line)=>{log += line + '\n';});
		this.toast.showAlert('FhemNative Log:', '', {
			inputs: [{
				name: 'mobile-for-copy',
				type: 'textarea',
				value: log
			}],
			buttons: [{text: this.translate.instant('GENERAL.BUTTONS.CLOSE'), role: 'cancel'}]
		});
	}

	// import settings handler 
	// after data read to prevent double messages
	private loadSettings(rawData: string): void{
		let isValid: boolean = false;
		try{
			const data: any = JSON.parse(rawData);
			if(data && data.connectionProfiles){
				isValid = true;
				// disconnect from fhem
				this.fhem.noReconnect = true;
				if(this.fhem.connected) this.fhem.disconnect();
				// start import
				const len = Object.keys(data).length;
				let i = 0;
				for (const [key, value] of Object.entries(data)){
					const val: any = value;
					if (key !== undefined) {
						this.storage.changeSetting({name: key, change: JSON.parse(val) }).then(()=>{
							i++;
							if (i === len) {
								// reconnect to fhem with new IP
								this.settings.loadDefaults().then(()=>{
									setTimeout(()=>{
										this.fhem.noReconnect = false;
										this.fhem.connectFhem();
										this.structure.loadRooms(false, false, false).then(()=>{
											const room: Room = this.structure.rooms[0];
											this.structure.navigateToRoom(room.name, room.ID, { 
												name: room.name, ID: room.ID, 
												UID: room.UID, reload: true,
												reloadID: this.settings.getUID()
											});
											this.closeSettings();
										});
									}, 100);
								});
							}
						});
					}
				}
			}
		}catch(e){

		}
		// message prexix
		const prefix: string = 'GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.';
		if(isValid){
			this.toast.showAlert( this.translate.instant(prefix + 'SUCCESS.TITLE'), this.translate.instant(prefix + 'SUCCESS.INFO'), false);
			this.logger.info('Settings import was successful');
		}else{
			this.toast.showAlert(this.translate.instant(prefix + 'ERROR.TITLE'), this.translate.instant(prefix + 'ERROR.INFO'), false);
			this.logger.info('Settings not imported (not valid)');
		}
	}

	// import FhemNative settings
	async importSettings(event: any): Promise<void>{
		let isValid: boolean = false;
		if(event && event.target && event.target.files){
			const file: File = event.target.files[0];
			if(file){
				const fileReader = new FileReader();

				fileReader.onload = (e: any) => {
					this.loadSettings(fileReader.result as string);
				}
				fileReader.readAsText(file);
			}else{
				this.loadSettings('');
			}
		}else{
			// create blank importer to show error
			this.loadSettings('');
		}
		// allow room reloading again
		this.settings.blockRoomReload = false;
	}

	// custom theme edit
	changeMenuMode(mode: string): void{
		this.menus[mode] = !this.menus[mode]; 
		// load devices to settings
		if(mode === 'advanced' && this.menus[mode]){
			this.http.get('https://raw.githubusercontent.com/Syrex-o/FhemNative/master/DEVICE_SIZE_LIST.json').subscribe((res:any)=>{
				if(res && res.DEVICES){
					this.devices = res.DEVICES;
				}
			});
		}
	}

	// change color in custom theme
	changeCustomColor(jsonProp: string, value: string){
		this.storage.changeSetting({
			name: 'customTheme',
			change: JSON.stringify(this.settings.app.customTheme)
		});
		this.theme.changeTheme('custom');
	}

	// toggle task change
	toggleTasks(event: boolean): void{
		if(event){
			this.task.listen();
		}else{
			this.task.unlisten();
		}
	}

	// show changelog
	toggleChangelog(): void{
		this.settings.modes.showLoader = true;
		this.menus.changeLog = !this.menus.changeLog;
		const baseUrl: string = 'https://raw.githubusercontent.com/Syrex-o/FhemNative/master/CHANGELOG.json';
		this.http.get(baseUrl).subscribe((res: any) => {
			if (res) {
				this.changelog = res;
				// displaying last version first
				this.changelog.selectedVersion = this.changelog.VERSIONS.length - 1;
			} else {
				this.toast.addNotify('Changelog', this.translate.instant('GENERAL.DICTIONARY.NO_CHANGELOG_PRESENT'), false);
			}
			this.settings.modes.showLoader = false;
		}, (error)=>{
			this.settings.modes.showLoader = false;
			this.menus.changeLog = false;
		});
	}

	// test configuration
	testSharedConfig(): Promise<boolean>{
		return new Promise((resolve)=>{
			this.fhem.sharedConfigPresence.devicePresent = false;
			this.fhem.sharedConfigPresence.readingPresent = false;
			this.settings.modes.showLoader = true;
			let close = (head: string, message: string, hideToast?: boolean): void =>{
				this.settings.modes.showLoader = false;
				if(!hideToast){
					this.toast.addToast(head, message, 'info');
				}
			}
			// test
			if(this.settings.app.sharedConfig.enable){
				if(this.settings.app.sharedConfig.device !== ''){
					this.fhem.handleSimpleDeviceRequest(this.settings.app.sharedConfig.device, 1000).then((foundDevice: FhemDevice|null)=>{
						if(foundDevice){
							this.fhem.sharedConfigPresence.devicePresent = true;
							if(this.settings.app.sharedConfig.reading !== '' && this.settings.app.sharedConfig.reading in foundDevice.readings){
								this.fhem.sharedConfigPresence.readingPresent = true;
								close('', '', true);
								resolve(true);
							}else{
								close(this.translate.instant('GENERAL.ERRORS.NOT_FOUND.READING_NOT_FOUND'), '');
								resolve(false);
							}
						}else{
							close(this.translate.instant('GENERAL.ERRORS.NOT_FOUND.DEVICE_NOT_FOUND'), '');
							resolve(false);
						}
					});
				}else{
					close(this.translate.instant('GENERAL.ERRORS.NOT_FOUND.DEVICE_NOT_DEFINED'), '');
					resolve(false);
				}
			}else{
				close('', '', true);
				resolve(false);
			}
		});
	}

	// transfer shared config
	transferSharedConfig(): void{
		this.toast.showAlert(
			this.translate.instant('GENERAL.SETTINGS.FHEM.SHARED_CONFIG.PICKER.TRANSFER.WARNING.HEADER'),
			this.translate.instant('GENERAL.SETTINGS.FHEM.SHARED_CONFIG.PICKER.TRANSFER.WARNING.MESSAGE'),
			{
				buttons: [
					{
						text: this.translate.instant('GENERAL.DICTIONARY.NO'),
						role: 'cancel'
					},
					{
						text: this.translate.instant('GENERAL.DICTIONARY.YES'),
						handler: () => {
							// test and transfer shared config
							this.testSharedConfig().then((res: boolean)=>{
								if(res){
									this.componentLoader.getMinifiedConfig().then((miniConf: Room[])=>{
										// send initial command to reading
										this.fhem.setAttr(
											this.settings.app.sharedConfig.device,
											this.settings.app.sharedConfig.reading,
											JSON.stringify(miniConf)
										);
									});
								}
							});
						}
					}
				]
			}
		);
	}

	// save shared config
	saveSharedConfig(): void{
		this.storage.changeSetting({ name: 'sharedConfig', change: JSON.stringify(this.settings.app.sharedConfig) }).then((res: any)=>{
			this.settings.app.sharedConfig = res;
			this.initialSettingsSharedConfig = JSON.parse(JSON.stringify(this.settings.app.sharedConfig));
			this.menus.sharedConfig = false;
			// test config
			this.testSharedConfig().then((res: boolean)=>{
				if(res){
					if(this.settings.app.sharedConfig.enable){
						// add shared config device to listen devices
						if(this.settings.app.sharedConfig.device !== ''){
							if(!this.fhem.listenDevices.find(x=> x.id === 'SHARED_CONFIG_DEVICE')){
								this.fhem.listenDevices.push({id: 'SHARED_CONFIG_DEVICE', device: this.settings.app.sharedConfig.device, handler: null});
							}
							// initially send request
							this.fhem.getDevice('SHARED_CONFIG_DEVICE', this.settings.app.sharedConfig.device, false, true).then((device)=>{
								this.fhem.deviceUpdateSub.next(device);
							});
						}
					}
				}
			});
		});
	}

	// revert settings if they are not saved
	revertSharedConfigSettings(): void{
		this.settings.app.sharedConfig = this.initialSettingsSharedConfig
		this.storage.changeSetting({
			name: 'sharedConfig',
			change: JSON.stringify(this.settings.app.sharedConfig)
		}).then((res: any)=>{
			this.settings.app.sharedConfig = res;
		});
	}

	// generate rooms
	generateRooms(): void{
		this.settings.modes.showLoader = true;
		let gotReply: boolean = false;
		const sub = this.fhem.deviceListSub.subscribe(next=>{
			this.settings.modes.showLoader = false;
			gotReply = true;
			sub.unsubscribe();

			const generatedRooms = this.addRooms(
				this.fhem.devices.filter((x)=>{ return Object.getOwnPropertyNames(x.attributes).find((y)=>{ return y === 'room'}) })
			);

			if(generatedRooms.length > 0){
				// save the generated rooms
				this.structure.saveRooms().then(() => {
					this.toast.showAlert(
						(generatedRooms.length > 1 ? this.translate.instant('GENERAL.DICTIONARY.ROOMS') : this.translate.instant('GENERAL.DICTIONARY.ROOM')) + ' ' + this.translate.instant('GENERAL.DICTIONARY.ADDED') + ':',
						(generatedRooms.length > 1 ?
							this.translate.instant('GENERAL.DICTIONARY.ROOMS') + ': ' :
							this.translate.instant('GENERAL.DICTIONARY.ROOM') + ': '
						) + generatedRooms.join(', ') + ' ' + this.translate.instant('GENERAL.DICTIONARY.ADDED') + '.',
						false
					);
				});
			} else{
				// No rooms added
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_INFO'),
					false
				);
			}
		});
		setTimeout(()=>{
			if(!gotReply){
				this.settings.modes.showLoader = false;
				sub.unsubscribe();
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_INFO_NOT_FOUND'),
					false
				);
			}
		}, 2000);
		this.fhem.listDevices('room=.*');
	}

	// generate devices
	generateDevices(): void{
		this.settings.modes.showLoader = true;
		// list of generated devices
		let generatedDevices: Array<any> = [];
		let gotReply: boolean = false;
		const sub: Subscription = this.fhem.deviceListSub.subscribe(next=>{
			this.settings.modes.showLoader = false;
			gotReply = true;
			sub.unsubscribe();
			// generate the rooms
			const generatedRooms: string[] = this.addRooms(
				this.fhem.devices.filter((x)=>{ return Object.getOwnPropertyNames(x.attributes).find((y)=>{ return y === 'room'}) })
			);
			// save the generated rooms
			this.structure.saveRooms().then(() => {
				// generate the devices
				const relevantDevices: FhemDevice[]  = this.fhem.devices.filter((x:any)=> {return Object.getOwnPropertyNames(x.attributes).find((y:any) => {return y.match(/FhemNative_.*/)})});
				relevantDevices.forEach((device: FhemDevice)=>{
					// get the relevant FhemNative readings
					const relevantAttributes: string[] = Object.getOwnPropertyNames(device.attributes).filter(y => y.match(/FhemNative_.*/));
					relevantAttributes.forEach((attribute: string)=>{
						const matchVal: any = attribute.match(/(_.*)$/g);
						if(matchVal){
							const component: string = matchVal[0].replace('_', '');

							const fhemNativeComponent: DynamicComponent|undefined = this.componentLoader.fhemComponents.find(x=> x.name.replace(' ', '').toLowerCase() === component.toLowerCase());
							// create component
							if(component && fhemNativeComponent){
								this.componentLoader.getFhemComponentData(component).then((componentData: DynamicComponentDefinition)=>{
									const creatorComponent: DynamicComponentDefinition = componentData;
									// get fhemnative attr
									const attr: any = device.attributes[attribute];
									attr.match(/[\w+:]+(?=;)/g).forEach((singleAttr: any)=>{
										// loop single attr and value combination
										const reading: string = singleAttr.match(/\w+/g)[0];
										const definedValue: any = singleAttr.match(/:.*/g)[0].slice(1);
										// assign the values in component
										for (const key of Object.keys(creatorComponent.attributes)) {
											let creatorAttributes: any = creatorComponent.attributes;
											creatorAttributes[key].forEach((fhemNativeAttr: {attr: string, value: any})=>{
												// underscore to ensure unique values (Exp. reading and setReading should not be equal)
												if(fhemNativeAttr.attr.toLowerCase().indexOf( '_' + reading.toLowerCase()) > -1){
													fhemNativeAttr.value = definedValue;
												}
												// assign device
												if(fhemNativeAttr.attr === 'data_device'){
													fhemNativeAttr.value = device.device;
												}
											});
										}
									});
									// component modified from fhem userAttr
									// get room information
									if(device.attributes.room){
										let rooms = [];
										if(device.attributes.room.indexOf('->') > -1){
											const pseudoRooms = device.attributes.room.split('->');
											// only get first structure
											if(pseudoRooms.length >= 2){
												rooms = [pseudoRooms[1]];
											}
										}else{
											rooms = device.attributes.room.split(',');
										}
										rooms.forEach((room: string)=>{
											const foundRoom: Room|undefined = this.structure.rooms.find(x=> x.name === room);
											if(foundRoom){
												// room found in structure
												// check if device is already defined
												if(foundRoom.components.filter((device: any)=> JSON.stringify(creatorComponent.attributes) === JSON.stringify(device.attributes)).length > 0){
													// component already defined with same values
													generatedDevices.push({device: device.device, generated: false, reason: 'ALREADY_DEFINED', room: room, as: component});
												}else{
													// new component --> add to room
													this.componentLoader.pushComponentToPlace(foundRoom.components, creatorComponent);
													generatedDevices.push({device: device.device, generated: true, room: room, as: component});
												}
											}else{	
												// component rejected because of strange room values
												generatedDevices.push({device: device.device, generated: false, reason: 'ROOM_NAME', as: component});
											}
										});
									}else{
										// no room for component
										generatedDevices.push({device: device.device, generated: false, reason: 'NO_ROOM', as: component});
									}
									if(generatedDevices.length > 0){
										this.devicesAdded(generatedDevices);
									}else{
										// No devices for FhemNative found
										this.toast.showAlert(this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_TITLE'),this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_INFO'),false);
									}
								});
							}
						}
					});
				});
			});
		});
		setTimeout(()=>{
			if(!gotReply){
				this.settings.modes.showLoader = false;
				sub.unsubscribe();
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_INFO'),
					false
				);
			}
		}, 2000);

		// send command
		this.fhem.listDevices('userattr=FhemNative.*');
	}

	// add rooms from devices to FhemNative
	addRooms(devices: FhemDevice[]): Array<any>{
		let generatedRooms: Array<any> = [];
		const settingsRooms = this.structure.rooms.map(x=> x.name);

		let roomAdder = (name: string, groupTo: any)=>{
			generatedRooms.push(name);
			this.structure.rooms.push({
				ID: this.structure.rooms.length,
				UID: '_' + Math.random().toString(36).substr(2, 9),
				name: name,
				icon: 'home',
				components: []
			});
			if(groupTo){
				const structureRoom: any = this.structure.rooms[groupTo];
				// test if room is already a structure
				if(structureRoom['useRoomAsGroup']){
					// room is a structure
					if(structureRoom.groupRooms.length > 0){
						// check if room has sub rooms
						const subFound = structureRoom['groupRooms'].find((x: any) => x.name === name);
						if(subFound){
							// room already found
							this.structure.rooms.splice(this.structure.rooms.length -1, 1);
							generatedRooms.splice(generatedRooms.length -1, 1);
						}else{
							// room not found
							let group: any = this.structure.rooms[groupTo].groupRooms;
							group.push({ID: this.structure.rooms.length -1, name: name});
						}
					}
				}else{
					// room is no structure
					this.structure.rooms[groupTo]['useRoomAsGroup'] = true;
					this.structure.rooms[groupTo]['groupRooms'] = [{ID: this.structure.rooms.length -1, name: name}];
				}
			}
		};

		// room name tester
		let roomTest = (roomName: string)=>{
			if(!roomName.match(/Unsorted|hidden/) && !settingsRooms.includes(roomName) && !generatedRooms.includes(roomName)){
				return roomName;
			}
			return false;
		}

		devices.forEach((device)=>{
			const roomAttr = device.attributes.room;
			// test for psudo rooms
			if(roomAttr.indexOf('->') > -1){
				let leftOverRooms = [];

				const psudoRoomCombination = roomAttr.match(/\w+->\w+/g);
				if(psudoRoomCombination){
					const pseudoRooms = psudoRoomCombination[0].split('->');
					const mainRoom = pseudoRooms[0];
					const subRoom = pseudoRooms[1];

					// get the rooms, that are left
					leftOverRooms = roomAttr.split(',')
					leftOverRooms.splice(leftOverRooms.indexOf(psudoRoomCombination[0]), 1);
					
					// test if mainRoom exists
					if(roomTest(mainRoom)){
						roomAdder(mainRoom, false);
					}
					// add sub room
					const room: Room|undefined = this.structure.rooms.find(x=> x.name === mainRoom);
					if(room){
						roomAdder(subRoom, room.ID);
					}
				}
				// add the left over rooms
				if(leftOverRooms.length > 0){
					leftOverRooms.forEach((room: string)=>{
						if(roomTest(room)){
							roomAdder(room, false);
						}
					});
				}
			}else{
				const rooms = roomAttr.split(',');
				rooms.forEach((room: string)=>{
					if(!room.match(/Unsorted|hidden/) && !settingsRooms.includes(room) && !generatedRooms.includes(room)){
						roomAdder(room, false);
					}
				});
			}
		});
		return generatedRooms;
	}

	private devicesAdded(generatedDevices: any){
		if(generatedDevices.filter((dev: any) => dev.generated).length > 0){
			this.structure.saveRooms().then(()=>{
				this.structure.loadRooms(true, false, true);
			});
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.COMPONENTS')+' '+this.translate.instant('GENERAL.DICTIONARY.ADDED'),
				generatedDevices.filter((dev: any) => dev.generated).map(
					(el: any)=> el.device +' '+
					this.translate.instant('GENERAL.DICTIONARY.AS')+' '+
					el.as +' '+
					this.translate.instant('GENERAL.DICTIONARY.TO')+' '+
					el.room
				).join("<br /> <br />"),
				[{
					text: this.translate.instant('GENERAL.BUTTONS.OKAY'),
					role: 'cancel',
					handler: (data: any) => this.rejectedDevices(generatedDevices)
				}]
			);
		}else{
			this.rejectedDevices(generatedDevices);
		}
	}

	private rejectedDevices(generatedDevices: any){
		if(generatedDevices.filter((dev: any) => !dev.generated).length > 0){
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_REASON_TITLE'),
				generatedDevices.filter((dev: any) => !dev.generated).map(
					(el: any)=> el.device +' '+
					this.translate.instant('GENERAL.DICTIONARY.AS')+' '+
					el.as +' '+
					(el.room ? ' '+this.translate.instant('GENERAL.DICTIONARY.TO')+' '+
						el.room+': ' : ': ') +
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_REASONS.'+el.reason)
				).join("<br /> <br />"),
				false
			);
		}
	}

	// reset settings to factory
	resetSettings(): void{
		this.toast.showAlert(
			this.translate.instant('GENERAL.RESET.REVERT.TITLE'),
			this.translate.instant('GENERAL.RESET.REVERT.SURE'),
			{
				buttons: [
					{
						text: this.translate.instant('GENERAL.DICTIONARY.NO'),
						role: 'cancel'
					},
					{
						text: this.translate.instant('GENERAL.DICTIONARY.YES'),
						handler: () => {
							// reset the settings
							this.resetAllSettings().then((res: boolean)=>{
								// reset done
								this.toast.showAlert(
									this.translate.instant('GENERAL.RESET.DONE.TITLE'),
									this.translate.instant('GENERAL.RESET.DONE.INFO'),
									false
								);
							});
						}
					}
				]
			}
		);
	}

	// settings reset
	resetAllSettings(): Promise<boolean>{
		return new Promise((resolve)=>{
			this.settings.appDefaults.forEach((setting: any, index: number)=>{
				this.storage.changeSetting({
					name: setting.name,
					change: setting.default
				}).then(()=>{
					if(index === this.settings.appDefaults.length -1){
						this.settings.loadDefaults().then(()=>{
							resolve(true);
						});
					}
				});
			});
		});
	}

	// toggle URL links
	support(url: string): void{
		window.open(url);
	}

}
@NgModule({
	imports: [ 
		IonicModule,
		FormsModule, 
		CommonModule,
		NewsSlideModule,
		TranslateModule, 
		SelectComponentModule,
		SwitchComponentModule,
		PickerComponentModule
	],
	declarations: [ CoreSettingsComponent ],
	exports: [ CoreSettingsComponent ]
})
export class CoreSettingsComponentModule {}