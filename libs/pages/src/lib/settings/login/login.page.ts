import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BackButtonService, FhemService, LoaderService, SettingsService, StorageService, StructureService, ToastService } from '@fhem-native/services';

import { ScrollHeaderModule } from '@fhem-native/directives';

import { CloseBtnContainerModule, InputModule, SelectColorModule, SelectModule, StateIconModule, SwitchModule, TextBlockModule } from '@fhem-native/components';

import { getUID } from '@fhem-native/utils';

import { ConnectionTypes, DefaultConnectionProfile } from '@fhem-native/app-config';
import { Route } from '@angular/router';

@Component({
	standalone: true,
	selector: 'fhem-native-login',
	templateUrl: 'login.page.html',
	styleUrls: ['../../pages.style.scss', 'login.page.scss'],
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule,
		// Components
		InputModule,
		SelectModule,
		SwitchModule,
		StateIconModule,
		TextBlockModule,
		SelectColorModule,
		CloseBtnContainerModule,
		// Directives
		ScrollHeaderModule
	]
})
export class LoginPageComponent implements OnInit, OnDestroy{
	private handleID = getUID();
	public connectionTypes = ConnectionTypes;

    constructor(
		private fhem: FhemService,
		private toast: ToastService,
		public navCtrl: NavController,
		private loader: LoaderService,
		private storage: StorageService,
		public settings: SettingsService,
		private backBtn: BackButtonService,
		private structure: StructureService,
		private translate: TranslateService){
	}

	ngOnInit(): void {
		this.fhem.blockReConnect = true;
		this.fhem.disconnect();
		this.backBtn.handle(this.handleID, ()=> this.cancelIPSettings());
	}

	// add connection profile
	addConnectionProfile(): void{
		this.settings.connectionProfiles.push({...DefaultConnectionProfile});
	}

	// delete profile
	removeConnectionProfile(index: number): void{
		this.settings.connectionProfiles.splice(index, 1);
	}

	// cancel btn
	async cancelIPSettings(): Promise<void>{
		this.settings.connectionProfiles = await this.storage.getSetting('connectionProfiles');
		if(this.settings.connectionProfiles.length === 0) this.settings.connectionProfiles.push({...DefaultConnectionProfile});
		this.navCtrl.back();
	}

	// save btn
	async testIPSettings(): Promise<void>{
		this.loader.showLogoLoader();

		if(this.fhem.checkPreConnect()){
			const testResult = [];

			this.loader.showLogoLoader(this.translate.instant('PAGES.LOGIN.TEST_CONNECTIONS'));
			for( const profile of this.settings.connectionProfiles){
				const test =  await this.fhem.testConnectionProfile(profile);
				testResult.push(test);
			}

			if(testResult.every(el=> el === true)){
				this.loader.hideLoader();
				// all done
				this.saveIPSettings();
			}else{
				if(testResult.every(el=> el === false)){
					// all profiles failed
					this.loader.hideLoader();
					this.toast.showAlert(this.translate.instant('PAGES.LOGIN.ERRORS.ALL_MISSING_DATA.TEXT'), this.translate.instant('PAGES.LOGIN.ERRORS.ALL_MISSING_DATA.INFO'), false);
				}else{
					// some profiles failed
					const missingIndexes: any = [];
					testResult.forEach((val, i)=> { if(!val) missingIndexes.push( '- ' + this.translate.instant('PAGES.LOGIN.CONNECTION_PROFILE') + ' ' +  (i + 1) ) });

					this.toast.showAlert(
						this.translate.instant('PAGES.LOGIN.ERRORS.PART_MISSING_DATA.TEXT'), 
						(
							this.translate.instant('PAGES.LOGIN.ERRORS.PART_MISSING_DATA.INFO') + ' <br> <br>' +
							missingIndexes.join(', <br>') + '<br> <br>' +
							this.translate.instant('PAGES.LOGIN.ERRORS.PART_MISSING_DATA.INFO2')
						),
						[
							{
								text: this.translate.instant('BUTTONS.EDIT'),
								role: 'cancel',
								handler: ()=> this.loader.hideLoader()
							},
							{
								text: this.translate.instant('BUTTONS.CONTINUE'),
								role: 'save',
								handler: ()=> this.saveIPSettings()
							},
						]
					);
				}
			}
		}else{
			this.loader.hideLoader();
			this.toast.showAlert(this.translate.instant('PAGES.LOGIN.ERRORS.MISSING_DATA.TEXT'), this.translate.instant('PAGES.LOGIN.ERRORS.MISSING_DATA.INFO'), false);
		}
	}

	private async saveIPSettings(): Promise<void>{
		// save profiles
		await this.storage.changeSetting({name: 'connectionProfiles', change: JSON.stringify(this.settings.connectionProfiles)});
		// navigate to initial room
		await this.structure.loadRooms(true);
	}

	ngOnDestroy(): void {
		this.fhem.blockReConnect = false;

		this.loader.hideLoader();
		// try to connect on page destroy
		this.fhem.resetConnectionTries();
		this.fhem.reconnect();
		this.backBtn.removeHandle(this.handleID);
	}
}

export const LOGIN_ROUTES: Route[] = [
    {
        path: '',
        component: LoginPageComponent
    }
];