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
	public IPsettings: any = {IP: '', PORT: '8080', WSS: false, type: 'Websocket'};

	// app modes
	public modes: any = {
		// editing mode
		roomEdit: false,
		menuEdit: false,
		fhemMenuMode: ''
	};
	// subscriber for modes
	public modeSub = new Subject<any>();

	// app error events -- for export to file
	public log: any = {
		isActive: false,
		events: []
	};

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
		// resetting app settings on start
		this.app = {};
		// generating app defaults and load them to app container
		const defaults = [
			{name: 'theme', default: 'dark'},
			{name: 'showToastMessages', default: true},
			{name: 'responsiveResize', default: false},
			{name: 'checkUpdates', default: false},
			{name: 'language', default: 'en'},
			{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20})}
		];
		for (let i = 0; i < defaults.length; i++) {
			this.storage.setAndGetSetting({
				name: defaults[i].name,
				default: defaults[i].default
			}).then((value) => {
				// assingning variables to defaults
				this.app[defaults[i].name] = value;
			});
		}
		// settings language
		this.storage.getSetting('language').then((res: any) => {
			this.translate.setDefaultLang(res || 'en');
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
