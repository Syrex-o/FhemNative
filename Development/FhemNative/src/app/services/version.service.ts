import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Ionic
import { Platform } from '@ionic/angular';

// Services
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { LoggerService } from './logger/logger.service';

@Injectable({
	providedIn: 'root'
})

export class VersionService {
	// github repo
	private repo: string = 'https://api.github.com/repos/Syrex-o/FhemNative/';
	// current App Version
	public appVersion: string = '2.6.2';

	constructor(
		private http: HttpClient,
		private logger: LoggerService,
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
	private checkVersion(): void{
		const checkRepo = this.http.get(this.repo + 'releases').subscribe((releases:any)=>{
			checkRepo.unsubscribe();
			if(releases){
				const lastVersion: number = parseInt(releases[0].tag_name.match(/\d+/g).join(''));
				const currentVersion: number = parseInt(this.appVersion.match(/\d+/g).join(''));
				if(lastVersion > currentVersion){
					this.logger.info('New version of FhemNative is available');
					// get correct system
					const assets: Array<any> = releases[0].assets;
					let os: string;
					let link: string = 'https://github.com/Syrex-o/FhemNative/releases/' + releases[0].tag_name;

					// check operating systems
					// windows and mac will directly opwn download 
					// Android: Current release, to manually download
					if(this.platform.is('android')){
						os = 'Android';
					}else{
						if(window.navigator.userAgent.indexOf("Mac") !== -1){
							os = 'MacOS';
							link = assets.find(x=> x.name.match(/\_(.*?)\_/g)[0] === '_MacOS_').browser_download_url;
						}
						if(window.navigator.userAgent.indexOf("Windows") !== -1){
							os = 'Windows';
							link = assets.find(x=> x.name.match(/\_(.*?)\_/g)[0] === '_Windows_').browser_download_url;
						}
					}
					this.createUpdateToast(os, link);
				}
			}
		});
	}

	// notify creator for version
	private createUpdateToast(os: string, link: string): void{
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