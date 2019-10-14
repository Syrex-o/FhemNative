import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

// Services
import { StorageService } from './storage.service';
import { HelperService } from './helper.service';
// Translator
import { TranslateService } from '@ngx-translate/core';

// Font Awesome Icons
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
// Icons
import { 
	faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight,
	faBath, faBus
} from '@fortawesome/free-solid-svg-icons';


@Injectable({
	providedIn: 'root'
})

export class SettingsService {
	// current App Version
	public appVersion: string = '2.0.4';
	// building default storage
	public app: any = {};

	// building ip settings
	public IPsettings: any = {};

	// app modes
	public modes: any = {
		// editing mode
		roomEdit: false,
		menuEdit: false,
		blockDefaultLoader: false,
		fhemMenuMode: ''
	};
	// subscriber for modes
	public modeSub = new Subject<any>();

	// app error events -- for export to file
	public log: any = {
		isActive: false,
		events: []
	};

	public appDefaults:Array<any> = [
		{name: 'theme', default: 'dark', toStorage: 'app'},
		{name: 'showToastMessages', default: true, toStorage: 'app'},
		{name: 'responsiveResize', default: true, toStorage: 'app'},
		{name: 'checkUpdates', default: false, toStorage: 'app'},
		{name: 'enableEditing', default: true, toStorage: 'app'},
		{name: 'language', default: 'en', toStorage: 'app', callback: (lang:any)=> {this.translate.setDefaultLang(lang || 'en');}},
		{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20}), toStorage: 'app'},
		{name: 'IPsettings', default: JSON.stringify({IP: '', PORT: '8080', WSS: false, type: 'Websocket'}), toStorage: false, callback: (data:any)=> {if(data.IP === ''){this.modes.fhemMenuMode = 'ip-config'}}}
	];

	// Available Icons for FhemNative
	public icons:Array<any> = [
		{type: 'ion', icon: 'home'},
		{type: 'ion', icon: 'alarm'},
		{type: 'ion', icon: 'basket'},
		{type: 'ion', icon: 'battery-charging'},
		{type: 'ion', icon: 'battery-dead'},
		{type: 'ion', icon: 'battery-full'},
		{type: 'ion', icon: 'bed'},
		{type: 'ion', icon: 'beer'},
		{type: 'ion', icon: 'bicycle'},
		{type: 'ion', icon: 'boat'},
		{type: 'ion', icon: 'bonfire'},
		{type: 'ion', icon: 'book'},
		{type: 'ion', icon: 'briefcase'},
		{type: 'ion', icon: 'bug'},
		{type: 'ion', icon: 'build'},
		{type: 'ion', icon: 'cafe'},
		{type: 'ion', icon: 'calendar'},
		{type: 'ion', icon: 'call'},
		{type: 'ion', icon: 'camera'},
		{type: 'ion', icon: 'car'},
		{type: 'ion', icon: 'clock'},
		{type: 'ion', icon: 'cog'},
		{type: 'ion', icon: 'contact'},
		{type: 'ion', icon: 'contacts'},
		{type: 'ion', icon: 'desktop'},
		{type: 'ion', icon: 'flower'},
		{type: 'ion', icon: 'images'},
		{type: 'ion', icon: 'information-circle'},
		{type: 'ion', icon: 'key'},
		{type: 'ion', icon: 'keypad'},
		{type: 'ion', icon: 'lock'},
		{type: 'ion', icon: 'map'},
		{type: 'ion', icon: 'partly-sunny'},
		{type: 'ion', icon: 'rainy'},
		{type: 'ion', icon: 'sunny'},
		{type: 'ion', icon: 'snow'},
		{type: 'ion', icon: 'power'},
		{type: 'ion', icon: 'radio'},
		{type: 'ion', icon: 'switch'},
		{type: 'ion', icon: 'trash'},
		{type: 'ion', icon: 'logo-windows'},
		{type: 'ion', icon: 'add-circle'},
		{type: 'ion', icon: 'checkmark-circle'},
		{type: 'ion', icon: 'close-circle'},
		// Font Awesome
		{type: 'fas', icon: 'ellipsis-h'},
		{type: 'fas', icon: 'angle-double-up'},
		{type: 'fas', icon: 'angle-double-down'},
		{type: 'fas', icon: 'angle-double-left'},
		{type: 'fas', icon: 'angle-double-right'},
		{type: 'fas', icon: 'bus'},
		{type: 'fas', icon: 'bath'}
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
		private translate: TranslateService,
		private helper: HelperService,
		private library: FaIconLibrary) {
		// listen to mode changes
		this.modeSub.subscribe(next => {
			for (const [key, value] of Object.entries(next)) {
				this.modes[key] = value;
			}
		});
		// Add FontAwesome Icons to library
		library.addIcons(
			faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight, faBath, faBus
		);
	}

	public iconFinder(name){
		return this.helper.find(this.icons, 'icon', name).item;
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
