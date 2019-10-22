import { Component } from '@angular/core';
import { MenuController, Platform, ModalController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Room Component for routing
import { RoomComponent } from './components/room/room.component';
import { SettingsRoomComponent } from './components/room/room-settings.component';
// Services
import { StructureService } from './services/structure.service';
import { FhemService } from './services/fhem.service';
import { SettingsService } from './services/settings.service';
import { ToastService } from './services/toast.service';

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

	constructor(
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		public structure: StructureService,
		private fhem: FhemService,
		public settings: SettingsService,
		public menu: MenuController,
		public modalController: ModalController,
		private http: HttpClient,
		private toast: ToastService,
		private translate: TranslateService) {
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

	async openSettings() {
		this.menu.close();
		const modal = await this.modalController.create({
			component: SettingsRoomComponent,
			cssClass: 'modal-fullscreen'
		});
		return await modal.present();
	}
}
