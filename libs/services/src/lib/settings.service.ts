import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Configs
import { BaseAppSettings, DefaultConnectionProfile } from '@fhem-native/app-config';

import { StorageService } from './storage.service';

import { AppSetting } from '@fhem-native/types/storage';
import { ConnectionProfile } from '@fhem-native/types/fhem';

@Injectable({providedIn: 'root'})
export class SettingsService {
    // building default storage
	public app: any = {};
	// main demo mode
	public demoMode = new BehaviorSubject<boolean>(false);
	
    // fhem connection profiles
	public connectionProfiles: ConnectionProfile[] = [];

    // app defaults
	public appDefaultsLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private appDefaults: AppSetting[] = BaseAppSettings.concat([
        // app language
		{name: 'language', default: 'de', toStorage: true, callback: (lang: string)=> {this.translate.setDefaultLang(lang || 'en');}},
        // fhem connection profiles
		{name: 'connectionProfiles', default: JSON.stringify([]), toStorage: false, callback: (data: any)=>{if(data.length === 0){ this.connectionProfiles = [{...DefaultConnectionProfile}]; }}},
    ]);

    constructor(protected storage: StorageService, protected translate: TranslateService){}

    // load app defaults
	public loadDefaults(): Promise<any>{
		return new Promise((resolve)=>{
			this.appDefaults.forEach((setting: AppSetting, index: number)=>{
				this.storage.setAndGetSetting({
					name: setting.name,
					default: setting.default
				}).then((res:any)=>{
					if(setting.toStorage){
						// loading to desired storage
						this.app[setting.name] = res;
					}else{
						// loading to dedicated variable
						(this as any)[setting.name] = res;
					}
					// check if new props added to a json setting
					if(this.storage.testJSON(setting.default)){
						// default json options detected
						const jsonSetting = JSON.parse(setting.default as any);
						let newProperties = false;
						for (const [key, value] of Object.entries(jsonSetting)) {
							if(res[key] === undefined){
								// new property found
								newProperties = true;
								if(setting.toStorage){
									this.app[setting.name][key] = value;
								}else{
									(this as any)[setting.name][key] = value;
								}
							}
						}
						if(newProperties){
							if(setting.toStorage){
								this.storage.changeSetting({
									name: setting.name,
									change: JSON.stringify(this.app[setting.name])
								});
							}else{
								this.storage.changeSetting({
									name: setting.name,
									change: JSON.stringify((this as any)[setting.name])
								});
							}
						}
					}
					// determine callbacks
					if(setting.callback){
						setting.callback( (setting.toStorage ? this.app[setting.name] : (this as any)[setting.name]) );
					}
					//
					if(index === this.appDefaults.length -1){
						// secure timeout, to ensure all settings are fully loaded
						setTimeout(()=>{
							this.appDefaultsLoaded.next(true);
							resolve(true);
						}, 0);
					}
				});
			});
		});
	}
}