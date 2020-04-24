import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Ionic
import { Platform } from '@ionic/angular';

// Services
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

@Injectable({
	providedIn: 'root'
})

export class VersionService {
	// github repo
	private repo: string = 'https://api.github.com/repos/Syrex-o/FhemNative/';
	// current App Version
	public appVersion: string = '2.5.1';

	constructor(
		private http: HttpClient,
		private storage: StorageService,
		private platform: Platform,
		private toast: ToastService){
		storage.getSetting('checkUpdates').then((state)=>{
			if(state){
				this.checkVersion();
			}
		});
	}

	// check version of FhemNative
	private checkVersion(){
		const checkRepo = this.http.get(this.repo + 'releases').subscribe((releases:any)=>{
			checkRepo.unsubscribe();
			if(releases){
				const lastVersion = parseInt(releases[releases.length -1].tag_name.match(/\d+/g).join(''));
				const currentVersion = parseInt(this.appVersion.match(/\d+/g).join(''));
				if(lastVersion > currentVersion){
					const assets: Array<any> = releases[releases.length -1].assets;
					let relevant: {os: string, obj: any};
					console.log(assets);
					// check operating systems
					if(this.platform.is('android')){
						relevant = {os: 'Android', obj: assets.find(x=> x.name.match(/\_(.*?)\_/g)[0] === '_Android_')};

					}else{
						if(window.navigator.userAgent.indexOf("Mac") !== -1){
							relevant = {os: 'MacOS', obj: assets.find(x=> x.name.match(/\_(.*?)\_/g)[0] === '_MacOS_')};
						}
						if(window.navigator.userAgent.indexOf("Windows") !== -1){
							relevant = {os: 'Windows', obj: assets.find(x=> x.name.match(/\_(.*?)\_/g)[0] === '_Windows_')};
						}
					}
					if(relevant.obj){
						this.createUpdateToast(relevant.os, relevant.obj.browser_download_url);
					}
				}
			}
		});
	}

	// notify creator for version
	private createUpdateToast(os: string, link: string){
		this.toast.addNotify(
			'New '+ os + ' version available',
			'Download', 
			true
		).then(click=>{
			if(click){
				window.open(link);
			}
		})
	}
}