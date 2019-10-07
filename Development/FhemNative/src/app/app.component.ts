import { Component } from '@angular/core';
import { MenuController, Platform, ModalController } from '@ionic/angular';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Subscription } from 'rxjs';

// Room Component for routing
import { RoomComponent } from './components/room/room.component';
import { SettingsRoomComponent } from './components/room/room-settings.component';
// Services
import { StructureService } from './services/structure.service';
import { StorageService } from './services/storage.service';
import { FhemService } from './services/fhem.service';
import { SettingsService } from './services/settings.service';
import { ToastService } from './services/toast.service';
import { HelperService } from './services/helper.service';
// Translator
import { TranslateService } from '@ngx-translate/core';

import { FHEM_COMPONENT_REGISTRY } from './components/fhem-components-registry';

// Http request for app version check
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {
	// available room copy
	private roomCopy :any;
	public showPicker :boolean = false;
	public selectedRoom :any;
	public wrongInput :boolean = false;

	// Room Parameters
	public useRoomAsGroup: boolean = false;
	public roomToGroup: boolean = false;

	public groupRooms: Array<any> = [];
	public selectedGroup: any = {};

	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		public structure: StructureService,
		private storage: StorageService,
		private fhem: FhemService,
		public settings: SettingsService,
		public menu: MenuController,
		public modalController: ModalController,
		private http: HttpClient,
		private toast: ToastService,
		private translate: TranslateService,
		private helper: HelperService) {
		this.structure.loadRooms(RoomComponent, true);
		this.initializeApp();
		// loading fhem components to structure
		this.structure.fhemComponents = FHEM_COMPONENT_REGISTRY;
		// load app App Defaults
		this.settings.loadDefaults(this.settings.appDefaults).then(()=>{
			// loading rooms from storage
			if(this.settings.IPsettings.IP !== ''){
				// connect to fhem
				this.fhem.connectFhem().then((e) => {
					
				}).catch((e) => {
					if (e.type === 'error') {
						this.fhem.disconnect();
						this.fhem.noReconnect = true;
						this.settings.modes.fhemMenuMode = 'ip-config';
					}
				});
			}
			if(this.settings.app.checkUpdates){
				this.checkForUpdate();
			}
		});
	}

	private checkForUpdate(){
		const baseUrl = "https://api.github.com/repos/Syrex-o/FhemNative/git/trees/master";
		this.http.get(baseUrl).subscribe((res:any)=>{
			const builds = res.tree.find(x=>x.path === 'Builds');
			this.http.get(builds.url).subscribe((b:any)=>{
				if(b){
					// get current android version
					if(this.platform.is('android')){
						const androidPath = b.tree.find(x=>x.path === 'Android');
						this.http.get(androidPath.url).subscribe((ver:any)=>{
							if(ver){
								this.evaluateVersions(ver.tree, 'Android');
							}
						});
					}
					if(this.platform.is('ios')){
						const iosPath = b.tree.find(x=>x.path === 'IOS');
						this.http.get(iosPath.url).subscribe((ver:any)=>{
							if(ver){
								this.evaluateVersions(ver.tree, 'IOS');
							}
						});
					}
					// get electron versions
					else{
						if(window.navigator.userAgent.indexOf("Mac") !== -1){
							const macosPath = b.tree.find(x=>x.path === 'MacOS');
							this.http.get(macosPath.url).subscribe((ver:any)=>{
								if(ver){
									this.evaluateVersions(ver.tree, 'MacOS');
								}
							});
						}
						if(window.navigator.userAgent.indexOf("Windows") !== -1){
							const windowsPath = b.tree.find(x=>x.path === 'Windows');
							this.http.get(windowsPath.url).subscribe((ver:any)=>{
								if(ver){
									this.evaluateVersions(ver.tree, 'Windows');
								}
							});
						}
					}
				}
			});
		});
	}

	private evaluateVersions(versions: Array<any>, buildPlatform: string){
		const lastVersion = parseInt(versions[versions.length -1].path.match(/\d+/g).join(''));
		const currentVersion = parseInt(this.settings.appVersion.match(/\d+/g).join(''));
		if(lastVersion > currentVersion){
			this.toast.addNotify(this.translate.instant('GENERAL.VERSIONS.NEW.TITLE'), this.translate.instant('GENERAL.VERSIONS.NEW.INFO'), true).then((click)=>{
				if(click){
					window.open('https://github.com/Syrex-o/FhemNative/blob/master/Builds/'+buildPlatform+'/'+versions[versions.length -1].path, '_system', 'location=yes');
				}
			});
		}
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
		});
	}

	public enableDrag() {
			this.roomCopy = JSON.parse(JSON.stringify( this.structure.rooms ));
			this.settings.modes.menuEdit = true;
		}

	public drop(event: CdkDragDrop<string[]>, subMenu) {
		moveItemInArray((!subMenu ? this.structure.structuredRooms : subMenu.groupRooms), event.previousIndex, event.currentIndex);
		this.structure.modifyRooms();
	}

	public editRoom(room) {
		this.selectedRoom = (room ? room : '');
		this.showPicker = !this.showPicker;
		this.groupRooms = this.structure.rooms.filter(roomFilter => roomFilter.useRoomAsGroup && roomFilter.ID !== room.ID);
		this.useRoomAsGroup = room.useRoomAsGroup ? true : false;
		const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> room.ID === el.ID));
		if(group.length > 0){
			this.roomToGroup = true;
			this.selectedGroup = {
				ID: group[0].ID,
				name: group[0].name
			};
		}else{
			this.roomToGroup = false;
			this.selectedGroup = {};
		}
	}

	public checkInput() {
		if (this.selectedRoom.name !== '') {
			this.wrongInput = false;
			return true;
		} else {
			this.wrongInput = true;
			setTimeout(() => {
				this.showPicker = true;
			}, 500);
			return false;
		}
	}

	public applyRoomChanges(){
		if(this.checkInput()){
			this.structure.rooms[this.selectedRoom.ID].name = this.selectedRoom.name;
			this.structure.rooms[this.selectedRoom.ID].icon = this.selectedRoom.icon;
			// check if room was moved out of group
			let outOfGroup = ()=>{
				const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> this.selectedRoom.ID === el.ID));
				if(group.length > 0){
					this.structure.rooms[group[0].ID].groupRooms.splice(this.helper.find(this.structure.rooms[group[0].ID].groupRooms, 'ID', this.selectedRoom.ID).index, 1);
				}
			}
			if(this.useRoomAsGroup){
				this.structure.rooms[this.selectedRoom.ID]['useRoomAsGroup'] = true;
				this.structure.rooms[this.selectedRoom.ID]['groupRooms'] = [];
			}else{
				if(this.structure.rooms[this.selectedRoom.ID].useRoomAsGroup !== undefined){
					this.structure.rooms[this.selectedRoom.ID].useRoomAsGroup = false;
					this.structure.rooms[this.selectedRoom.ID]['groupRooms'] = [];
				}
			}
			if(!this.roomToGroup){
				outOfGroup();
			}else{
				outOfGroup();
				if(this.selectedGroup.name){
					// check if group already has rooms inside
					if(!this.structure.rooms[this.selectedGroup.ID]['groupRooms']){
						this.structure.rooms[this.selectedGroup.ID]['groupRooms'] = [];
					}
					this.structure.rooms[this.selectedGroup.ID]['groupRooms'].push({
						ID: this.structure.rooms[this.selectedRoom.ID].ID,
						name: this.structure.rooms[this.selectedRoom.ID].name
					});
				}
			}
			this.structure.getStructuredRoomList();
		}
	}

	public removeRoom(selectedRoom) {
		this.structure.rooms.splice(selectedRoom.ID, 1);
		this.structure.modifyRooms();
	}

	public cancelChanges() {
		this.settings.modes.menuEdit = false;
		this.structure.rooms = this.roomCopy;
		this.structure.getStructuredRoomList();
	}

	public saveChanges() {
		this.settings.modes.menuEdit = false;
		// saving new room order
		// resetting angular router
		this.structure.saveRooms().then(() => {
			this.structure.resetRouter(RoomComponent);
		});
	}

	async openSettings() {
		this.menu.close();
		const modal = await this.modalController.create({
			component: SettingsRoomComponent,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
	}

	public toggleSubMenu(event){
		event.target.parentNode.parentNode.classList.toggle('show-submenu');
	}

	public grouper(scenario, event){
		if(event){
			if(scenario === 'useAsGroup'){
				this.roomToGroup = false;
			}else{
				this.useRoomAsGroup = false;
			}
		}
	}
}
