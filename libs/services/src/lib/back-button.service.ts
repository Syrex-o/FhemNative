import { Injectable, Inject } from '@angular/core';

import { APP_CONFIG } from '@fhem-native/app-config';

import { App } from '@capacitor/app';

interface BackBtnSub {
	handleID: string,
	callback: ()=> void,
	removeOnCallback: boolean
}

@Injectable({providedIn: 'root'})
export class BackButtonService {
	private subs: BackBtnSub[] = [];

	constructor(@Inject(APP_CONFIG) private appConfig: any){
		// back button listener
		if(this.appConfig.platform === 'mobile') App.addListener('backButton', ({canGoBack})=> this.handleBackBtn(canGoBack) );
	}

	private async handleBackBtn(canGoBack: boolean): Promise<void>{
		// default behaviour
		if(this.subs.length === 0){
			if(canGoBack) return window.history.back();
			return App.exitApp();
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