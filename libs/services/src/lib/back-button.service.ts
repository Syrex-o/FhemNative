import { Injectable, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ToastService } from './toast.service';
import { APP_CONFIG, AppConfig } from '@fhem-native/app-config';

import { App } from '@capacitor/app';

interface BackBtnSub {
	handleID: string,
	callback: ()=> void,
	removeOnCallback: boolean
}

@Injectable({providedIn: 'root'})
export class BackButtonService {
	private lastTimeBackPress = 0;
    private timePeriodToExit = 2000;

	private subs: BackBtnSub[] = [];

	constructor(
		private toast: ToastService, 
		private translate: TranslateService,
		@Inject(APP_CONFIG) private appConfig: AppConfig){
	}

	public initialize(){
		if(this.appConfig.platform === 'mobile') App.addListener('backButton', ({canGoBack})=> this.handleBackBtn(canGoBack) );
	}

	private async handleBackBtn(canGoBack: boolean): Promise<void>{
		// default behaviour
		if(this.subs.length === 0 || !canGoBack){
			if(new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) return App.exitApp();

			this.toast.addToast(
                this.translate.instant('PAGES.HOME.CLOSE_TOAST.HEAD'), 
                this.translate.instant('PAGES.HOME.CLOSE_TOAST.INFO'), 
                'info', this.timePeriodToExit
            );
            this.lastTimeBackPress = new Date().getTime();
		}

		// callback of custom logic
		const relevantSub = this.subs[this.subs.length -1];
		if(!relevantSub) return;

		relevantSub.callback();
		if(relevantSub.removeOnCallback) this.removeHandle(relevantSub.handleID);
	}

	public handle(handleID: string, callback: ()=> void, removeOnCallback?: boolean): void{
		// only add handles for mobile
		if(this.appConfig.platform !== 'mobile') return;

		removeOnCallback = removeOnCallback || false;

		const existingSub = this.subs.find(x=> x.handleID === handleID);
		if(existingSub){
			existingSub.callback = callback;
			existingSub.removeOnCallback = removeOnCallback;
			return;
		}

		this.subs.push({handleID, callback, removeOnCallback});
	}

	// remove a handle
	public removeHandle(handleID: string): void{
		const index: number = this.subs.findIndex(x => x.handleID === handleID);
		if(index > -1) this.subs.splice(index, 1);
	}
}