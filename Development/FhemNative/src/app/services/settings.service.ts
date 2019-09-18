import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

// Services
import { StorageService } from './storage.service';
// Translator
import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})

export class SettingsService {
	// current App Version
	public appVersion: string = '2.0.1';
	// building default storage
	public app: any = {};

	// building ip settings
	public IPsettings: any = {};

	// app modes
	public modes: any = {
		// editing mode
		roomEdit: false,
		menuEdit: false,
		blockDefaultComponentLoader: false,
		fhemMenuMode: ''
	};
	// subscriber for modes
	public modeSub = new Subject<any>();

	// app error events -- for export to file
	public log: any = {
		isActive: false,
		events: []
	};

	private appDefaults:Array<any> = [
		{name: 'theme', default: 'dark', toStorage: 'app'},
		{name: 'showToastMessages', default: true, toStorage: 'app'},
		{name: 'responsiveResize', default: true, toStorage: 'app'},
		{name: 'checkUpdates', default: false, toStorage: 'app'},
		{name: 'language', default: 'en', toStorage: 'app', callback: (lang:any)=> {this.translate.setDefaultLang(lang || 'en');}},
		{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20}), toStorage: 'app'},
		{name: 'IPsettings', default: JSON.stringify({IP: '', PORT: '8080', WSS: false, type: 'Websocket'}), toStorage: false}
	];

	// Available Icons for FhemNative
	public icons: Array<any> = [
		'home', 'alarm', 'basket', 'battery-charging',
		'battery-dead', 'battery-full', 'bed',
		'beer', 'bicycle', 'boat', 'bonfire',
		'book', 'briefcase', 'bug', 'build', 'cafe',
		'calendar', 'call', 'camera', 'car', 'clock', 'cog',
		'contact', 'contacts', 'desktop', 'flower',
		'images', 'information-circle', 'key', 'keypad',
		'lock', 'map', 'partly-sunny', 'rainy', 'sunny', 'snow',
		'power', 'radio', 'switch', 'trash', 'add-circle',
		'checkmark-circle', 'close-circle'
	];
	// Available component colors for FhemNative
	public componentColors: Array<any> = [
		'#fbfbfb', '#86d993', '#fb0a2a', '#02adea',
		'#00405d', '#ffcc33', '#ff6138', '#ff0000',
		'#fcd20b', '#e47911', '#a4c639', '#7fbb00',
		'#0060a3', '#1d8dd5', '#003366', '#005cff',
		'#97b538'
	];

	constructor(
		private storage: StorageService,
		private translate: TranslateService) {
		// listen to mode changes
		this.modeSub.subscribe(next => {
			for (const [key, value] of Object.entries(next)) {
				this.modes[key] = value;
			}
		});
	}

	// load default app settings
	public loadDefaults(defaults){
		return new Promise((resolve) => {
			for (let i = 0; i < defaults.length; i++) {
				this.storage.setAndGetSetting({
					name: defaults[i].name,
					default: defaults[i].default
				}).then((res:any)=>{
					if(defaults[i].toStorage){
						// loading to desired storage
						this[defaults[i].toStorage][defaults[i].name] = res;
					}else{
						// loading to dedicated variable
						this[defaults[i].name] = res;
					}
					// determine callbacks
					if(defaults[i].callback){
						defaults[i].callback(res);
					}
					if(i === defaults.length -1){
						resolve()
					}
				});
			}
		});
	}

	public changeAppSetting(storage, value) {
		this.storage.changeSetting({name: storage, change: value}).then((res) => {this.app[storage] = res; });
	}

	public changeAppSettingJSON(storage, jsonProp, value) {
		this.app[storage][jsonProp] = value;
		this.storage.changeSetting({
			name: storage,
			change: JSON.stringify(this.app[storage])
		}).then((res) => {
			this.app[storage] = res;
		});
	}
}
