import { Component } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { StructureService } from '../../services/structure.service';
import { CreateComponentService } from '../../services/create-component.service';

import { ModalController, Platform } from '@ionic/angular';

// Http request for app version check
import { HttpClient } from '@angular/common/http';

// Translator
import { TranslateService } from '@ngx-translate/core';

// Plugins
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import { RoomComponent } from '../room/room.component';

@Component({
	selector: 'room-settings',
	template: `
		<ion-header [ngClass]="settings.app.theme">
			<ion-toolbar>
				<ion-title>{{ 'GENERAL.SETTINGS.TITLE' | translate }}</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content padding [ngClass]="settings.app.theme">
			<div class="page">
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.FHEM.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.WEBSOCKET.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.FHEM.WEBSOCKET.INFO' | translate }}</p>
						<button (click)="settings.modes.fhemMenuMode  = 'ip-config'; modalCtrl.dismiss();" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.FHEM.WEBSOCKET.BUTTON' | translate }}</button>
						<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.EXPORT.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.FHEM.EXPORT.INFO' | translate }}</p>
						<div class="share-container">
							<button class="shareBtn" (click)="share('local')" matRipple [matRippleColor]="'#d4d4d480'"><ion-icon name="download"></ion-icon></button>
							<button class="shareBtn" (click)="share('common')" matRipple [matRippleColor]="'#d4d4d480'"><ion-icon name="share"></ion-icon></button>
						</div>
						<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.IMPORT.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.FHEM.IMPORT.INFO' | translate }}</p>
						<button (click)="importSettings()" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.FHEM.IMPORT.BUTTON' | translate }}</button>
						<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.AUTO_ROOMS.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.FHEM.AUTO_ROOMS.INFO' | translate }}</p>
						<button (click)="generateRooms()" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.FHEM.AUTO_ROOMS.BUTTON' | translate }}</button>
					</div>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.APP.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.APP.THEME.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.APP.THEME.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="settings.app.theme" (ionChange)="settings.changeAppSetting('theme', $event.detail.value)">
					        <ion-select-option value="dark">{{ 'GENERAL.SETTINGS.APP.THEME.OPTIONS.DARK' | translate }}</ion-select-option>
					        <ion-select-option value="bright">{{ 'GENERAL.SETTINGS.APP.THEME.OPTIONS.BRIGHT' | translate }}</ion-select-option>
					    </ion-select>
					</div>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.APP.LANGUAGE.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.APP.LANGUAGE.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="settings.app.language" (ionChange)="settings.changeAppSetting('language', $event.detail.value); translate.use(settings.app.language);">
					        <ion-select-option value="en">{{ 'GENERAL.SETTINGS.APP.LANGUAGE.OPTIONS.EN' | translate }}</ion-select-option>
					        <ion-select-option value="de">{{ 'GENERAL.SETTINGS.APP.LANGUAGE.OPTIONS.DE' | translate }}</ion-select-option>
					    </ion-select>
					</div>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.showToastMessages"
						[label]="'GENERAL.SETTINGS.APP.TOAST.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.TOAST.INFO' | translate"
						(onToggle)="settings.changeAppSetting('showToastMessages', $event)">
					</switch>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.checkUpdates"
						[label]="'GENERAL.SETTINGS.APP.VERSION_CHECK.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.VERSION_CHECK.INFO' | translate"
						(onToggle)="settings.changeAppSetting('checkUpdates', $event)">
					</switch>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.log.isActive"
						[label]="'GENERAL.SETTINGS.APP.LOG.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.LOG.INFO' | translate"
						(onToggle)="logWarning($event)">
					</switch>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.COMPONENTS.TITLE' | translate }}</p>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.grid.enabled"
						[label]="'GENERAL.SETTINGS.COMPONENTS.GRID.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.COMPONENTS.GRID.INFO' | translate"
						(onToggle)="settings.changeAppSettingJSON('grid', 'enabled', $event)">
					</switch>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.COMPONENTS.GRID_SIZE.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.COMPONENTS.GRID_SIZE.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="settings.app.grid.gridSize" (ionChange)="settings.changeAppSettingJSON('grid', 'gridSize', $event.detail.value)">
					        <ion-select-option [value]="10">10</ion-select-option>
					        <ion-select-option [value]="20">20</ion-select-option>
					        <ion-select-option [value]="30">30</ion-select-option>
					        <ion-select-option [value]="40">40</ion-select-option>
					    </ion-select>
					</div>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.responsiveResize"
						[label]="'GENERAL.SETTINGS.COMPONENTS.RESPONSIVE_RESIZE.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.COMPONENTS.RESPONSIVE_RESIZE.INFO' | translate"
						(onToggle)="settings.changeAppSetting('responsiveResize', $event)">
					</switch>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.CHANGELOG.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.INFO' | translate }}</p>
						<button (click)="toggleChangelog()" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.BUTTON' | translate }}</button>
					</div>
				</div>
				<div>
					<p class="label">{{ 'GENERAL.SETTINGS.SOFTWARE.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.INFO' | translate }}</p>
						<button (click)="pickerMode = 'thx'; showPicker  = true;" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.BUTTON' | translate }}</button>
					</div>
				</div>
			</div>
			<picker
				*ngIf="pickerMode === 'changelog'"
				[ngClass]="settings.app.theme"
				[height]="'60%'"
				[showConfirmBtn]="false"
				[cancelBtn]="'GENERAL.BUTTONS.CLOSE' | translate"
				[(ngModel)]="showPicker">
				<div class="page changelog" *ngIf="changelog">
					<p class="label">{{ 'GENERAL.SETTINGS.CHANGELOG.PICKER.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.CHANGELOG.SELECTOR.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.CHANGELOG.SELECTOR.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="changelog.selectedVersion">
					        <ion-select-option *ngFor="let item of changelog.VERSIONS; let i = index;" [value]="i">{{item.VERSION}}</ion-select-option>
					    </ion-select>
					</div>
					<div class="category-inner">
						<p class="label-des">{{changelog.VERSIONS[changelog.selectedVersion].DATE}} App Version: {{changelog.VERSIONS[changelog.selectedVersion].VERSION}}</p>
						<div class="category" *ngFor="let change of changelog.VERSIONS[changelog.selectedVersion].CHANGES">
							<p class="label-des">{{change.TYPE}}:</p>
							<p class="label-des" [ngClass]="change.TYPE">{{change.CHANGE}}</p>
						</div>
					</div>
				</div>
			</picker>
			<picker
				*ngIf="pickerMode === 'thx'"
				[ngClass]="settings.app.theme"
				[height]="'100%'"
				[showConfirmBtn]="false"
				[cancelBtn]="'Schließen'"
				[(ngModel)]="showPicker">
				<div class="page">
					<p class="label">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.INFO' | translate }}</p>
						<div class="category">
							<p class="label-des">Angular</p>
							<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.ANGULAR' | translate }}</p>
						</div>
						<div class="category">
							<p class="label-des">Ionic</p>
							<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.IONIC' | translate }}</p>
						</div>
						<div class="category">
							<p class="label-des">Electron</p>
							<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.ELECTRON' | translate }}</p>
						</div>
						<div class="category">
							<p class="label-des">FHEM</p>
							<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.FHEM' | translate }}</p>
						</div>
						<div class="category">
							<p class="label-des">ntruchsess</p>
							<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.ntruchsess' | translate }}</p>
						</div>
						<p class="label">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.TITLE' | translate }}</p>
						<div class="category">
							<p class="label-des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.TITLE' | translate }}</p>
							<ul>
								<li>
									<p class="label-des">Storage</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.STORAGE' | translate }}</p>
								</li>
								<li>
									<p class="label-des">File</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.FILE' | translate }}</p>
								</li>
								<li>
									<p class="label-des">SocialSharing</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.SOCIALSHARING' | translate }}</p>
								</li>
								<li>
									<p class="label-des">Chooser</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.CHOOSER' | translate }}</p>
								</li>
								<li>
									<p class="label-des">ImagePicker</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.IMAGEPICKER' | translate }}</p>
								</li>
								<li>
									<p class="label-des">WebView</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.IONIC.WEBVIEW' | translate }}</p>
								</li>
							</ul>
						</div>
						<div class="category">
							<p class="label-des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.EXTERNAL.TITLE' | translate }}</p>
							<ul>
								<li>
									<p class="label-des">D3</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.EXTERNAL.D3' | translate }}</p>
								</li>
								<li>
									<p class="label-des">Ngx-toastr</p>
									<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.EXTERNAL.NGXTOASTER' | translate }}</p>
								</li>
							</ul>
						</div>
						<div>
							<p class="label-des">{{ 'GENERAL.SETTINGS.SOFTWARE.PICKER.MORE.OTHERS.TITLE' | translate }}</p>
							<ul>
								<li>
									<p class="label-des">Temperature dragger</p>
									<p class="des">https://github.com/akveo/ngx-admin</p>
								</li>
								<li>
									<p class="label-des">D3 Liquid Gauge</p>
									<p class="des">Curtis Bratton: http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</picker>
		</ion-content>
	`,
	styles: [`
		.page{
			padding: 10px;
		}
		.category{
			border-bottom: var(--dark-border-full);
			padding-bottom: 10px;
			// box-shadow: 0px 0.175em 0.5em rgba(2, 8, 20, 0.1), 0px 0.085em 0.175em rgba(2, 8, 20, 0.08);
		}
		.category-inner{
			padding-left: 8px;
			position: relative;
		}
		.label{
			font-weight: 600;
		}
		.label-des{
			margin-bottom: 5px;
			margin-top: 5px;
		}
		.des{
			margin-top: -2px;
			margin-bottom: 5px;
			font-size: .8em;
			color: var(--p-small) !important;
		}
		.item{
			min-height: 60px;
		}
		button{
			background: var(--btn-blue);
			height: 40px;
			color: #fff;
			font-size: 1.1em;
		}
		button:focus{
			outline: 0px;
		}
		p{
			color: #000;
		}
		.shareBtn{
			width: 45px;
			height: 45px;
			border-radius: 50%;
			position: relative;
			margin-right: 15px;
		}
		.shareBtn ion-icon{
			width: 100%;
			height: 100%;
		}
		ion-select{
			position: absolute;
			right: 5px;
			top: 0;
		}
		.changelog .category{
			margin-top: 15px;
		}
		.changelog .category .label-des{
			margin-bottom: -5px;
		}
		.dark p,
		.dark ul,
		.dark ion-select{
			color: var(--dark-p);
		}
		ion-content.dark,
		.dark ion-toolbar{
			--background: var(--dark-bg);
		}

		.changelog .category .label-des.NEW{
			color: var(--btn-blue);
		}
		.changelog .category .label-des.FIX{
			color: var(--btn-green);
		}
		.changelog .category .label-des.DEL{
			color: var(--btn-red)
		}
	`]
})
export class SettingsRoomComponent {
	public showPicker = false;
	public pickerMode = '';

	public changelog: any;

	constructor(
		public settings: SettingsService,
		private fhem: FhemService,
		private structure: StructureService,
		private toast: ToastService,
		public translate: TranslateService,
		public modalCtrl: ModalController,
		private file: File,
		private http: HttpClient,
		private storage: StorageService,
		private platform: Platform,
		private socialSharing: SocialSharing,
		private chooser: Chooser,
		private createComponent: CreateComponentService,
		private webview: WebView) {
	}

	public logWarning(event) {
		if (event) {
			this.settings.log.events.push(new Date + ' INFO: Logging started');
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.LOG_STARTED_TITLE'),
				this.translate.instant('GENERAL.DICTIONARY.LOG_STARTED_INFO'),
				false
			);
		} else {
			this.settings.log.events.push(new Date + ' INFO: Logging ended');
			this.createFile('FhemNative_LOG_' + Date.now().toString() + '.json', this.settings.log.events.join('\r\n')).then((e: any) => {
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.LOG_ENDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.LOG_ENDED_INFO') + ' ' + e.dir + ' ' + this.translate.instant('GENERAL.DICTIONARY.AS') + ' ' + e.name + '.',
					false
				);
			}).catch((err) => {
				this.toast.showAlert(
					this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.DIRECTORY'),
					this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.DIRECTORY'),
					false
				);
				throw new Error(this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.DIRECTORY'));
			});
		}
	}

	private getDir() {
		if (this.platform.is('mobile')) {
			return (this.file.externalRootDirectory === null) ? this.file.externalDataDirectory : this.file.externalRootDirectory;
		} else {
			const remote = (window as any).require('electron').remote;
			return remote.app.getPath('home');
		}
	}

	private createFile(name, data) {
		return new Promise((resolve, reject) => {
			const dir = this.getDir();
			if (dir) {
				if (this.platform.is('mobile')) {
					this.file.writeFile(dir, name, data, {replace: true}).then((res) => {
						resolve({dir, name});
					}).catch((err) => {
						reject(dir);
					});
				} else {
					const fs = (window as any).require('fs');
					fs.writeFile(dir+'/'+name, data, (err) => {
						if (err) {reject(dir); }
						resolve({dir, name});
					});
				}
			}
		});
	}

	public share(varaint) {
		this.storage.getAllSettings().then((res: any) => {
			console.log(res);
			this.createFile('FhemNative_settings.json', JSON.stringify(res)).then((data: any) => {
				if (varaint === 'local') {
					this.toast.showAlert(
						this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_TITLE'),
						this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_INFO') + data.dir + ' ' + this.translate.instant('GENERAL.DICTIONARY.AS') + ' ' + data.name + '.',
						false
					);
				} else {
					if (this.platform.is('mobile')) {
						this.socialSharing.share(
							this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.SHARE.TITLE'),
							this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.SHARE.INFO'),
							data.dir + '/FhemNative_settings.json'
						);
					} else {
						const mail = 'mailto:?subject=' +
							this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.SHARE.TITLE') + '&body=' +
							this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.SHARE.INFO') + '. ' + data.dir;
    					window.location.href = mail;
					}
				}
			}).catch((err) => {
				throw new Error(this.translate.instant('GENERAL.SETTINGS.FHEM.EXPORT.MESSAGES.DIRECTORY'));
			});
		});
	}

	public importSettings() {
		if (this.platform.is('mobile')) {
			this.chooser.getFile('').then((file) => {
				if (file.name.indexOf('FhemNative_settings') !== -1) {
					this.evaluateJsonImport(new TextDecoder("utf-8").decode(file.data));
				} else {
					this.toast.showAlert(
						this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.TITLE'),
						this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.INFO'),
						false
					);
				}
			}).catch((err) => {
				this.toast.showAlert(
					this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.TITLE'),
					this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.INFO'),
					false
				);
			});
		} else {
			const remote = (window as any).require('electron').remote;
			const dialog = remote.dialog;
			dialog.showOpenDialog({properties: ['openFile']}, (path) => {
		        if (path !== undefined) {
		        	if (path[0].indexOf('FhemNative_settings') !== -1) {
		        		const fs = (window as any).require('fs');
		        		const data = fs.readFileSync(path[0], 'utf8');
		        		this.evaluateJsonImport(data);
		        	} else {
		        		this.toast.showAlert(
							this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.TITLE'),
							this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.ERROR.INFO'),
							false
						);
		        	}
		        }
		    });
		}
	}

	private arrayBufferToBase64( buffer ) {
		let binary = '';
	    let bytes = new Uint8Array( buffer );
	    let len = bytes.byteLength;
	    for (let i = 0; i < len; i++) {
	        binary += String.fromCharCode( bytes[ i ] );
	    }
	    return window.btoa( binary );
	}

	private evaluateJsonImport(rawData) {
		// disconnect from fhem
		this.fhem.noReconnect = true;
		this.settings.modes.blockDefaultLoader = true;
		this.fhem.disconnect();

		const len = Object.keys(JSON.parse(rawData)).length;
		let i = 0;
		for (const [key, value] of Object.entries(JSON.parse(rawData))) {
			const val:any = value;
			if (key !== undefined) {
				this.storage.changeSetting({
					name: key,
					change: JSON.parse(val)
				}).then(() => {
					i++;
					if (i === len) {
						// reconnect to fhem with new IP
						this.settings.loadDefaults(this.settings.appDefaults).then(()=>{
							this.fhem.noReconnect = false;
							this.fhem.connectFhem();
							this.structure.loadRooms(RoomComponent, true);
							this.settings.modes.blockDefaultLoader = false;
						});
						this.modalCtrl.dismiss();
						this.toast.showAlert(
							this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.SUCCESS.TITLE'),
							this.translate.instant('GENERAL.SETTINGS.FHEM.IMPORT.MESSAGES.SUCCESS.INFO'),
							false
						);
					}
				});
			}
		}
	}

	public generateRooms() {
		const rooms = [];
		const settingsRooms = [];
		for (let i = 0; i < this.structure.rooms.length; i++) {
			settingsRooms.push(this.structure.rooms[i].name);
		}
		for (let i = 0; i < this.fhem.devices.length; i++) {
			if (this.fhem.devices[i].attributes && this.fhem.devices[i].attributes.room) {
				let room = this.fhem.devices[i].attributes.room;
				room = room.indexOf(',') === -1 && room !== 'hidden' ? room : '';
				if (rooms.indexOf(room) === -1 && room !== '' && settingsRooms.indexOf(room) === -1) {
					rooms.push(room);
					this.structure.rooms.push({
						ID: this.structure.rooms.length,
						name: room,
						icon: 'home',
						components: []
					});
				}
			}
		}
		if (rooms.length > 0) {
			this.structure.saveRooms().then(() => {
				this.toast.showAlert(
					(rooms.length > 1 ? this.translate.instant('GENERAL.DICTIONARY.ROOMS') : this.translate.instant('GENERAL.DICTIONARY.ROOM')) + ' ' + this.translate.instant('GENERAL.DICTIONARY.ADDED') + ':',
					(rooms.length > 1 ?
						this.translate.instant('GENERAL.DICTIONARY.ROOMS') + ': ' :
						this.translate.instant('GENERAL.DICTIONARY.ROOM') + ': '
					) + rooms.join(', ') + ' ' + this.translate.instant('GENERAL.DICTIONARY.ADDED') + '.',
					false
				);
				this.structure.resetRouter(RoomComponent);
			});
		} else {
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_TITLE'),
				this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_INFO'),
				false
			);
		}
	}

	// reading changelog from github
	public toggleChangelog() {
		const baseUrl = 'https://raw.githubusercontent.com/Syrex-o/FhemNative/master/CHANGELOG.json';
		this.http.get(baseUrl).subscribe((res: any) => {
			if (res) {
				this.changelog = res;
				// displaying last version first
				this.changelog.selectedVersion = this.changelog.VERSIONS.length - 1;
				this.pickerMode = 'changelog';
				this.showPicker  = !this.showPicker;
			} else {
				this.toast.addNotify('Changelog', this.translate.instant('GENERAL.DICTIONARY.NO_CHANGELOG_PRESENT'), false);
			}
		});
	}
}
