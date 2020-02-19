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
	faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck, faDoorOpen, faDoorClosed,
	faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, faThermometerFull,
	faTemperatureLow, faTemperatureHigh
} from '@fortawesome/free-solid-svg-icons';


@Injectable({
	providedIn: 'root'
})

export class SettingsService {
	// current App Version
	public appVersion: string = '2.2.5';
	// building default storage
	public app: any = {};

	// building ip settings
	public IPsettings: any = {};

	// app modes
	public modes: any = {
		// indicated edit mode
		roomEdit: false,
		// indicates who initiated editing
		roomEditFrom: null,
		changeRoom: false,
		// events
		blockDefaultLoader: false,
		fhemMenuMode: '',
		// indicate different states
		// component create/edit
		showComponentConfig: false,
		// component test mode
		componentTest: false
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
		{name: 'responsiveResize', default: false, toStorage: 'app'},
		{name: 'checkUpdates', default: false, toStorage: 'app'},
		{name: 'enableEditing', default: true, toStorage: 'app'},
		{name: 'enableUndoRedo', default: false, toStorage: 'app'},
		{name: 'showTasks', default: false, toStorage: 'app'},
		{name: 'hapticFeedback', default: JSON.stringify({enable: false, duration: 1}), toStorage: 'app'},
		{name: 'acusticFeedback', default: JSON.stringify({enable: false, audio: '1'}), toStorage: 'app'},
		{name: 'loadFhemDevices', default: JSON.stringify({dynamicComponentLoader: false, enable: true, option: 'Component'}), toStorage: 'app'},
		{name: 'customColors', default: JSON.stringify([]), toStorage: false, callback: (data:any)=>{if(data.length > 0){this.componentColors = this.componentColors.concat(data)}}},
		{name: 'language', default: 'en', toStorage: 'app', callback: (lang:any)=> {this.translate.setDefaultLang(lang || 'en');}},
		{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20}), toStorage: 'app'},
		{name: 'IPsettings', default: JSON.stringify({IP: '', PORT: '8080', WSS: false, type: 'Websocket', basicAuth: false, USER: '', PASSW: ''}), toStorage: false, callback: (data:any)=> {if(data.IP === ''){this.modes.fhemMenuMode = 'ip-config'}}}
	];

	// Available Icons for FhemNative
	public icons:Array<any> = [
		// Ionic Icons
		{type: 'ion', icon: 'home'},{type: 'ion', icon: 'alarm'},{type: 'ion', icon: 'basket'},{type: 'ion', icon: 'battery-charging'},
		{type: 'ion', icon: 'battery-dead'},{type: 'ion', icon: 'battery-full'},{type: 'ion', icon: 'bed'},{type: 'ion', icon: 'beer'},
		{type: 'ion', icon: 'bicycle'},{type: 'ion', icon: 'boat'},{type: 'ion', icon: 'bonfire'},{type: 'ion', icon: 'book'},
		{type: 'ion', icon: 'briefcase'},{type: 'ion', icon: 'bug'},{type: 'ion', icon: 'build'},{type: 'ion', icon: 'cafe'},
		{type: 'ion', icon: 'calendar'},{type: 'ion', icon: 'call'},{type: 'ion', icon: 'camera'},{type: 'ion', icon: 'car'},
		{type: 'ion', icon: 'clock'},{type: 'ion', icon: 'cog'},{type: 'ion', icon: 'contact'},{type: 'ion', icon: 'contacts'},
		{type: 'ion', icon: 'desktop'},{type: 'ion', icon: 'flower'},{type: 'ion', icon: 'images'},{type: 'ion', icon: 'information-circle'},
		{type: 'ion', icon: 'key'},{type: 'ion', icon: 'keypad'},{type: 'ion', icon: 'lock'},{type: 'ion', icon: 'map'},{type: 'ion', icon: 'partly-sunny'},
		{type: 'ion', icon: 'cloudy'}, {type: 'ion', icon: 'thunderstorm'}, {type: 'ion', icon: 'cloudy-night'}, {type: 'ion', icon: 'moon'},
		{type: 'ion', icon: 'rainy'},{type: 'ion', icon: 'sunny'},{type: 'ion', icon: 'snow'},{type: 'ion', icon: 'power'},{type: 'ion', icon: 'radio'},
		{type: 'ion', icon: 'switch'},{type: 'ion', icon: 'trash'},{type: 'ion', icon: 'logo-windows'},{type: 'ion', icon: 'add-circle'},
		{type: 'ion', icon: 'checkmark-circle'},{type: 'ion', icon: 'close-circle'}, {type: 'ion', icon: 'walk'}, {type: 'ion', icon: 'play'}, {type: 'ion', icon: 'pause'},
		{type: 'ion', icon: 'square'}, {type: 'ion', icon: 'fastforward'}, {type: 'ion', icon: 'skip-forward'}, {type: 'ion', icon: 'rewind'}, {type: 'ion', icon: 'skip-backward'},
		{type: 'ion', icon: 'shuffle'}, {type: 'ion', icon: 'repeat'},
		// Font Awesome
		{type: 'fas', icon: 'ellipsis-h'},
		{type: 'fas', icon: 'angle-double-up'},
		{type: 'fas', icon: 'angle-double-down'},
		{type: 'fas', icon: 'angle-double-left'},
		{type: 'fas', icon: 'angle-double-right'},
		{type: 'fas', icon: 'bus'},
		{type: 'fas', icon: 'calendar'},
		{type: 'fas', icon: 'calendar-alt'},
		{type: 'fas', icon: 'calendar-check'},
		{type: 'fas', icon: 'door-open'},
		{type: 'fas', icon: 'door-closed'},
		{type: 'fas', icon: 'fan'},
		{type: 'fas', icon: 'lightbulb'},
		{type: 'fas', icon: 'thermometer-empty'},
		{type: 'fas', icon: 'thermometer-half'},
		{type: 'fas', icon: 'thermometer-full'},
		{type: 'fas', icon: 'temperature-low'},
		{type: 'fas', icon: 'temperature-high'},
	];

	// Available component colors for FhemNative
	public componentColors: Array<any> = [
		'#fbfbfb', '#86d993', '#fb0a2a', '#02adea',
		'#00405d', '#ffcc33', '#ff6138', '#ff0000',
		'#fcd20b', '#e47911', '#a4c639', '#7fbb00',
		'#0060a3', '#1d8dd5', '#003366', '#005cff',
		'#97b538', '#272727', '#2ec6ff', '#434E5D',
		'#58677C', '#58677c', '#14a9d5', '#2994b3',
		'#a2a4ab', '#FF0909', '#F3481A', '#FABA2C',
		'#00BCF2', '#ddd', '#fff', '#000', 
		'transparent'
	];

	// user added colors
	private customColors: Array<any> = [];

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
			faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight, faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck,
			faDoorOpen, faDoorClosed, faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, faThermometerFull, faTemperatureLow, faTemperatureHigh
		);
	}

	// find icon
	public iconFinder(name){
		return this.helper.find(this.icons, 'icon', name).item;
	}

	// find new colors
	public findNewColors(arr){
		let newColors = [];
		arr.forEach((elem)=>{
			// check if attribute is defined
			if(elem){
				elem.forEach((attr)=>{
					// check for array
					if(Array.isArray(attr.value)){
						attr.value.forEach((singleValue)=>{
							if(!this.componentColors.includes(singleValue) && !newColors.includes(singleValue) && this.helper.checkValidHex(singleValue)){
								newColors.push(singleValue);
							}
						});
					}else{
						if(!this.componentColors.includes(attr.value) && !newColors.includes(attr.value) && this.helper.checkValidHex(attr.value)){
							newColors.push(attr.value);
						}
					}
				});
			}
		});
		// add new colors to custom colors
		if(newColors.length > 0){
			this.storage.changeSetting({
				name: 'customColors',
				change: JSON.stringify(this.customColors.concat(newColors))
			}).then((res:any)=>{
				this.componentColors = this.componentColors.concat(res);
			});
		}
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
					// check if new props added to a json setting
					if(this.helper.testJSON(defaults[i].default)){
						// default json options detected
						const jsonSetting = JSON.parse(defaults[i].default);
						let newProperties: boolean = false;
						for (const [key, value] of Object.entries(jsonSetting)) {
							if(res[key] === undefined){
								// new property found
								newProperties = true;
								if(defaults[i].toStorage){
									this[defaults[i].toStorage][defaults[i].name][key] = value;
								}else{
									this[defaults[i].name][key] = value;
								}
							}
						}
						if(newProperties){
							if(defaults[i].toStorage){
								this.storage.changeSetting({
									name: defaults[i].name,
									change: JSON.stringify(this[defaults[i].toStorage][defaults[i].name])
								});
							}else{
								this.storage.changeSetting({
									name: defaults[i].name,
									change: JSON.stringify(this[defaults[i].name])
								});
							}
						}
					}
					// determine callbacks
					if(defaults[i].callback){
						defaults[i].callback( (defaults[i].toStorage ? this[defaults[i].toStorage][defaults[i].name] : this[defaults[i].name]) );
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
