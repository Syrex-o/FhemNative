import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { FhemService } from '../../services/fhem.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { StructureService } from '../../services/structure.service';
import { TasksService } from '../../services/tasks.service';
import { NativeFunctionsService } from '../../services/native-functions.service';
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

import { RoomComponent } from '../room/room.component';

@Component({
	selector: 'room-settings',
	template: `
		<ion-header [ngClass]="settings.app.theme">
			<ion-toolbar>
			    <button class="back-btn" (click)="modalCtrl.dismiss();" matRipple [matRippleColor]="'#d4d4d480'">
			    	<ion-icon name="arrow-round-back"></ion-icon>
			    </button>
				<ion-title>{{ 'GENERAL.SETTINGS.TITLE' | translate }}</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding" [ngClass]="settings.app.theme">
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

						<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.AUTO_DEVICES.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.FHEM.AUTO_DEVICES.INFO' | translate }}</p>
						<button (click)="generateDevices()" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.FHEM.AUTO_DEVICES.BUTTON' | translate }}</button>
						<switch
							[customMode]="true"
							[padding]="false"
							[(ngModel)]="settings.app.loadFhemDevices.enable"
							[label]="'GENERAL.SETTINGS.FHEM.LOAD_ALL_DEVICES.TITLE' | translate"
							[subTitle]="'GENERAL.SETTINGS.FHEM.LOAD_ALL_DEVICES.INFO' | translate"
							(onToggle)="settings.changeAppSettingJSON('loadFhemDevices', 'enable', $event)">
						</switch>
						<div class="category-inner no-margin" *ngIf="!settings.app.loadFhemDevices.enable">
							<p class="label-des">{{ 'GENERAL.SETTINGS.FHEM.LOAD_WHICH_DEVICES.TITLE' | translate }}</p>
							<p class="des">{{ 'GENERAL.SETTINGS.FHEM.LOAD_WHICH_DEVICES.INFO' | translate }}</p>
							<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
			                	[(ngModel)]="settings.app.loadFhemDevices.option" (ionChange)="settings.changeAppSettingJSON('loadFhemDevices', 'option', $event.detail.value)">
						        <ion-select-option value="Component">{{ 'GENERAL.SETTINGS.FHEM.LOAD_WHICH_DEVICES.OPTIONS.Component' | translate }}</ion-select-option>
						        <ion-select-option value="Fhem_Defined">{{ 'GENERAL.SETTINGS.FHEM.LOAD_WHICH_DEVICES.OPTIONS.Fhem_Defined' | translate }}</ion-select-option>
						    </ion-select>
						</div>
						<switch
							[customMode]="true"
							[padding]="false"
							[(ngModel)]="settings.app.loadFhemDevices.dynamicComponentLoader"
							[label]="'GENERAL.SETTINGS.FHEM.DYNAMIC_COMPONENT_LOADER.TITLE' | translate"
							[subTitle]="'GENERAL.SETTINGS.FHEM.DYNAMIC_COMPONENT_LOADER.INFO' | translate"
							(onToggle)="settings.changeAppSettingJSON('loadFhemDevices', 'dynamicComponentLoader', $event)">
						</switch>
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
						[(ngModel)]="settings.app.enableEditing"
						[label]="'GENERAL.SETTINGS.APP.EDITING.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.EDITING.INFO' | translate"
						(onToggle)="settings.changeAppSetting('enableEditing', $event)">
					</switch>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.enableUndoRedo"
						[label]="'GENERAL.SETTINGS.APP.UNDO_REDO.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.UNDO_REDO.INFO' | translate"
						(onToggle)="settings.changeAppSetting('enableUndoRedo', $event)">
					</switch>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.showToastMessages"
						[label]="'GENERAL.SETTINGS.APP.TOAST.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.TOAST.INFO' | translate"
						(onToggle)="settings.changeAppSetting('showToastMessages', $event)">
					</switch>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.showTasks"
						[label]="'GENERAL.SETTINGS.APP.TASKS.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.APP.TASKS.INFO' | translate"
						(onToggle)="settings.changeAppSetting('showTasks', $event); toggleTasks($event);">
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
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.hapticFeedback.enable"
						[label]="'GENERAL.SETTINGS.COMPONENTS.VIBRATION.ENABLE.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.COMPONENTS.VIBRATION.ENABLE.INFO' | translate"
						(onToggle)="settings.changeAppSettingJSON('hapticFeedback', 'enable', $event)">
					</switch>
					<div class="category-inner" *ngIf="settings.app.hapticFeedback.enable">
						<p class="label-des">{{ 'GENERAL.SETTINGS.COMPONENTS.VIBRATION.DURATION.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.COMPONENTS.VIBRATION.DURATION.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="settings.app.hapticFeedback.duration" 
		                	(ionChange)="settings.changeAppSettingJSON('hapticFeedback', 'duration', $event.detail.value)">
					        <ion-select-option [value]="0.2">200ms</ion-select-option>
					        <ion-select-option [value]="0.5">500ms</ion-select-option>
					        <ion-select-option [value]="1">1s</ion-select-option>
					        <ion-select-option [value]="2">2s</ion-select-option>
					    </ion-select>
					</div>
					<switch
						[customMode]="true"
						[(ngModel)]="settings.app.acusticFeedback.enable"
						[label]="'GENERAL.SETTINGS.COMPONENTS.SOUND.ENABLE.TITLE' | translate"
						[subTitle]="'GENERAL.SETTINGS.COMPONENTS.SOUND.ENABLE.INFO' | translate"
						(onToggle)="settings.changeAppSettingJSON('acusticFeedback', 'enable', $event)">
					</switch>
					<div class="category-inner" *ngIf="settings.app.acusticFeedback.enable">
						<p class="label-des">{{ 'GENERAL.SETTINGS.COMPONENTS.SOUND.PATH.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.COMPONENTS.SOUND.PATH.INFO' | translate }}</p>
						<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
		                	[(ngModel)]="settings.app.acusticFeedback.audio" 
		                	(ionChange)="settings.changeAppSettingJSON('acusticFeedback', 'audio', $event.detail.value); native.playAudio($event.detail.value)">
					        <ion-select-option [value]="'1'">1</ion-select-option>
					        <ion-select-option [value]="'2'">2</ion-select-option>
					        <ion-select-option [value]="'3'">3</ion-select-option>
					        <ion-select-option [value]="'4'">4</ion-select-option>
					    </ion-select>
					</div>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.CHANGELOG.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.INFO' | translate }}</p>
						<button (click)="toggleChangelog()" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.CHANGELOG.LOG.BUTTON' | translate }}</button>
					</div>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.SOFTWARE.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.INFO' | translate }}</p>
						<button (click)="pickerMode = 'thx'; showPicker  = true;" matRipple [matRippleColor]="'#d4d4d480'">{{ 'GENERAL.SETTINGS.SOFTWARE.THIRD_PARTY.BUTTON' | translate }}</button>
					</div>
				</div>
				<div class="category">
					<p class="label">{{ 'GENERAL.SETTINGS.SUPPORT.TITLE' | translate }}</p>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.SUPPORT.DONATE.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.SUPPORT.DONATE.INFO' | translate }}</p>
						<button (click)="support('https://paypal.me/pools/c/8gwg2amXDT')">{{ 'GENERAL.SETTINGS.SUPPORT.BUTTON' | translate }}</button>
					</div>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.SUPPORT.DOCUMENTATION.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.SUPPORT.DOCUMENTATION.INFO' | translate }}</p>
						<button (click)="support('https://github.com/Syrex-o/FhemNative')">{{ 'GENERAL.SETTINGS.SUPPORT.BUTTON' | translate }}</button>
					</div>
					<div class="category-inner">
						<p class="label-des">{{ 'GENERAL.SETTINGS.SUPPORT.HELP.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.SETTINGS.SUPPORT.HELP.INFO' | translate }}</p>
						<button (click)="support('https://forum.fhem.de/index.php/board,102.0.html')">{{ 'GENERAL.SETTINGS.SUPPORT.BUTTON' | translate }}</button>
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
					        <ion-select-option 
					        	*ngFor="let item of changelog.VERSIONS; let i = index;" 
					        	[value]="i"
					        	[disabled]="isVersionAvailable(i)">
					        	{{item.VERSION}}
					        </ion-select-option>
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
		.category-inner.no-margin{
			padding-left: 0px;
		}
		.label{
			font-weight: 600;
		}
		.label-des{
			margin-bottom: 5px;
			margin-top: 5px;
			font-weight: 500;
		}
		.des{
			margin-top: -2px;
			margin-bottom: 5px;
			font-size: .8em;
			color: var(--p-small) !important;
			max-width: 80%;
		}
		.item{
			min-height: 60px;
		}
		button{
			background: var(--btn-blue);
			height: 40px;
			font-size: 1.1em;
			margin-bottom: 8px;
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
			max-width: 30%;
		}
		.changelog .category{
			margin-top: 15px;
		}
		.changelog .category .label-des{
			margin-bottom: -5px;
		}
		.dark p,
		.dark ul,
		.dark ion-select,
		.dark button{
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
		.back-btn{
			background: transparent;
			float: left;
			font-size: 30px;
			margin-left: 8px;
		}
		ion-title{
			transform: translateY(5px);
		}

		@media only screen and (max-width: 500px) {
			ion-select{
				max-width: 20%;
			}
		}
	`]
})
export class SettingsRoomComponent {
	public showPicker = false;
	public pickerMode = '';

	public changelog: any;

	private devicesListSub: Subscription;

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
		private helper: HelperService,
		private task: TasksService,
		public native: NativeFunctionsService) {
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

	private evaluateJsonImport(rawData) {
		// disconnect from fhem
		this.fhem.noReconnect = true;
		this.settings.modes.blockDefaultLoader = true;
		if(this.fhem.connected){
			this.fhem.disconnect();
		}

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

	// add rooms from devices to FhemNative
	public addRooms(devices: Array<any>){
		let generatedRooms = [];
		const settingsRooms = this.structure.rooms.map(x=> x.name);

		let roomAdder = (name, groupTo)=>{
			generatedRooms.push(name);
			this.structure.rooms.push({
				ID: this.structure.rooms.length,
				UID: this.helper.UIDgenerator(),
				name: name,
				icon: 'home',
				components: []
			});
			if(groupTo){
				const structureRoom = this.structure.rooms[groupTo];
				// test if room is already a structure
				if(structureRoom['useRoomAsGroup']){
					// room is a structure
					if(structureRoom.groupRooms.length > 0){
						// check if room has sub rooms
						const subFound = structureRoom['groupRooms'].find(x => x.name === name);
						if(subFound){
							// room already found
							this.structure.rooms.splice(this.structure.rooms.length -1, 1);
							generatedRooms.splice(generatedRooms.length -1, 1);
						}else{
							// room not found
							this.structure.rooms[groupTo].groupRooms.push({ID: this.structure.rooms.length -1, name: name});
						}
					}
				}else{
					// room is no structure
					this.structure.rooms[groupTo]['useRoomAsGroup'] = true;
					this.structure.rooms[groupTo]['groupRooms'] = [{ID: this.structure.rooms.length -1, name: name}];
				}
			}
		};

		devices.forEach((device)=>{
			const roomAttr = device.attributes.room;
			// test for psudo rooms
			if(roomAttr.indexOf('->') > -1){
				const pseudoRooms = roomAttr.split('->');
				// only get first structure
				if(pseudoRooms.length >= 2){
					const mainRoom = pseudoRooms[0];
					const subRoom = pseudoRooms[1];
					// test if mainRoom exists
					if(!mainRoom.match(/Unsorted|hidden/) && !settingsRooms.includes(mainRoom) && !generatedRooms.includes(mainRoom)){
						roomAdder(mainRoom, false);
					}
					roomAdder(subRoom, this.structure.rooms.find(x=> x.name === mainRoom).ID);
				}
			}else{
				const rooms = roomAttr.split(',');
				rooms.forEach((room)=>{
					if(!room.match(/Unsorted|hidden/) && !settingsRooms.includes(room) && !generatedRooms.includes(room)){
						roomAdder(room, false);
					}
				});
			}
		});
		return generatedRooms;
	}

	public generateRooms() {
		let gotReply: boolean = false;

		this.devicesListSub = this.fhem.devicesListSub.subscribe(next=>{
			gotReply = true;
			this.devicesListSub.unsubscribe();
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
					this.structure.resetRouter(RoomComponent);
				});
			}else{
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
				this.devicesListSub.unsubscribe();
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_ROOMS_ADDED_INFO_NOT_FOUND'),
					false
				);
			}
		}, 2000);
		this.fhem.listDevices('room=.*');
	}

	public generateDevices(){
		// list of generated devices
		let generatedDevices = [];
		let gotReply: boolean = false;
		this.devicesListSub = this.fhem.devicesListSub.subscribe(next=>{
			gotReply = true;
			this.devicesListSub.unsubscribe();
			// generate the rooms
			const generatedRooms = this.addRooms(this.fhem.devices.filter((x)=>{ return Object.getOwnPropertyNames(x.attributes).find((y)=>{ return y === 'room'}) }));
			// generate the devices
			const relevantDevices = this.fhem.devices.filter((x:any)=> {return Object.getOwnPropertyNames(x.attributes).find((y:any) => {return y.match(/FhemNative_.*/)})});
			relevantDevices.forEach((device)=>{
				const relevantReadings = Object.getOwnPropertyNames(device.attributes).filter(y => y.match(/FhemNative_.*/));
				relevantReadings.forEach((reading)=>{
					const component = reading.match(/(_.*)$/g)[0].replace('_', '');
					if(this.createComponent.fhemComponents.find(x=> x.name.replace(' ', '').toLowerCase() === component.toLowerCase())){
						const creatorComponent = this.createComponent.fhemComponents.find(x=> x.name.replace(' ', '').toLowerCase() === component.toLowerCase());
						const attr = device.attributes[reading];
						attr.match(/[\w+:]+(?=;)/g).forEach((singleAttr)=>{
							const reading = singleAttr.match(/\w+/g)[0];
							const settedValue = singleAttr.match(/:.*/g)[0].slice(1);
							for (const [key, value] of Object.entries(creatorComponent.component)) {
								if(key.toLowerCase().indexOf(reading.toLowerCase()) !== -1){
									creatorComponent.component[key] = settedValue;
									break;
								}else{
									if(key === 'data_device'){
										creatorComponent.component[key] = device.device;
									}else{
										creatorComponent.component[key] = value;
									}
								}
							}
						});
						let pushComponent = {
							attributes: this.createComponent.seperateComponentValues(creatorComponent.component),
							comp: creatorComponent,
							REF: creatorComponent.REF,
							dimensions: creatorComponent.dimensions
						};
						// getting room information
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
							rooms.forEach((room)=>{
								const foundRoom = this.helper.find(this.structure.rooms, 'name', room);
								if(foundRoom){
									// room found in structure
									// check if device is already defined
									if(foundRoom.item.components.filter(device=> JSON.stringify(pushComponent.attributes) === JSON.stringify(device.attributes)).length > 0){
										// component already defined
										generatedDevices.push({device: device.device, generated: false, reason: 'ALREADY_DEFINED', room: room, as: component});
									}else{
										// new component, add to room
										this.createComponent.pushComponentToPlace(foundRoom.item.components, pushComponent);
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
					}else{
						// wrong definition
						generatedDevices.push({device: device.device, generated: false, reason: 'NO_COMPONENT', as: component});
					}
				});
			});
			if(generatedDevices.length > 0){
				this.devicesAdded(generatedDevices);
			}else{
				// No devices for FhemNative found
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_INFO'),
					false
				);
			}
		});
		setTimeout(()=>{
			if(!gotReply){
				this.devicesListSub.unsubscribe();
				this.toast.showAlert(
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_TITLE'),
					this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_INFO'),
					false
				);
			}
		}, 2000);
		this.fhem.listDevices('userattr=FhemNative.*');
	}

	private devicesAdded(generatedDevices){
		if(generatedDevices.filter(dev => dev.generated).length > 0){
			this.structure.saveRooms().then(()=>{
				this.structure.loadRooms(RoomComponent, true);
			});
			this.toast.showAlert(
				this.translate.instant('GENERAL.DICTIONARY.COMPONENTS')+' '+this.translate.instant('GENERAL.DICTIONARY.ADDED'),
				generatedDevices.filter(dev => dev.generated).map(
					el=> el.device +' '+
					this.translate.instant('GENERAL.DICTIONARY.AS')+' '+
					el.as +' '+
					this.translate.instant('GENERAL.DICTIONARY.TO')+' '+
					el.room
				).join("<br /> <br />"),
				[{
	    			text: this.translate.instant('GENERAL.BUTTONS.OKAY'),
	    			role: 'cancel',
	    			handler: data => this.rejectedDevices(generatedDevices)
	    		}]
			);
		}else{
			this.rejectedDevices(generatedDevices);
		}
	}

	private rejectedDevices(generatedDevices){
		if(generatedDevices.filter(dev => !dev.generated).length > 0){
			this.toast.showAlert(
		    	this.translate.instant('GENERAL.DICTIONARY.NO_COMPONENTS_ADDED_REASON_TITLE'),
		    	generatedDevices.filter(dev => !dev.generated).map(
		    		el=> el.device +' '+
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

	// reading changelog from github
	public toggleChangelog() {
		const baseUrl = 'https://raw.githubusercontent.com/Syrex-o/FhemNative/master/CHANGELOG.json';
		this.http.get(baseUrl).subscribe((res: any) => {
			if (res) {
				this.changelog = res;
				// displaying last version first
				const relChangelog = this.changelog.VERSIONS.findIndex(v=> v.VERSION === this.settings.appVersion);

				this.changelog.selectedVersion = relChangelog > -1 ? relChangelog : this.changelog.VERSIONS.length - 1;

				this.pickerMode = 'changelog';
				this.showPicker  = !this.showPicker;
			} else {
				this.toast.addNotify('Changelog', this.translate.instant('GENERAL.DICTIONARY.NO_CHANGELOG_PRESENT'), false);
			}
		});
	}

	public isVersionAvailable(index){
		const relChangelog = this.changelog.VERSIONS.findIndex(v=> v.VERSION === this.settings.appVersion);
		if(relChangelog > -1){
			if(index <= relChangelog){
				return false;
			}else{
				return true;
			}
		}else{
			return false;
		}
	}

	// toggle URL links
	public support(url){
		window.open(url, '_system', 'location=yes');
	}

	// task service enabler/ disabler
	public toggleTasks(event){
		if(event){
			this.task.listen();
		}else{
			this.task.unlisten();
		}
	}
}
