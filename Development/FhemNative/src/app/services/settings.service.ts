import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Services
import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';

// Font Awesome Icons
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
// Icons
import { 
	faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight,
	faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck, faDoorOpen, faDoorClosed,
	faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, faThermometerFull,
	faTemperatureLow, faTemperatureHigh, faWindowRestore, faClipboardCheck, faClipboard, 
	faClipboardList, faPaste, faObjectGroup, faObjectUngroup, faFileExport, faFileImport,
	faDog, faPaw, faBone, faPlug, faSolarPanel, faLeaf, faSeedling, faWater, faFaucet, faSwimmingPool, faShower,
	faTint
} from '@fortawesome/free-solid-svg-icons';

// Interfaces
interface AppSetting {
	name: string,
	default: any,
	toStorage: boolean,
	callback?: (data:any)=> any
}

@Injectable({
	providedIn: 'root'
})

export class SettingsService {
	// building default storage
	public app: any = {};
	// fhem connection profiles
	public connectionProfiles: Array<any> = [];

	// Available Icons for FhemNative
	public icons:Array<any> = [
		// Ionic Icons
		{type: 'ion', icon: 'home'},{type: 'ion', icon: 'alarm'},{type: 'ion', icon: 'basket'},{type: 'ion', icon: 'battery-charging'},
		{type: 'ion', icon: 'battery-dead'},{type: 'ion', icon: 'battery-full'},{type: 'ion', icon: 'bed'},{type: 'ion', icon: 'beer'},
		{type: 'ion', icon: 'bicycle'},{type: 'ion', icon: 'boat'},{type: 'ion', icon: 'bonfire'},{type: 'ion', icon: 'book'},
		{type: 'ion', icon: 'briefcase'},{type: 'ion', icon: 'bug'},{type: 'ion', icon: 'build'},{type: 'ion', icon: 'cafe'},
		{type: 'ion', icon: 'calendar'},{type: 'ion', icon: 'call'},{type: 'ion', icon: 'camera'},{type: 'ion', icon: 'car'},
		{type: 'ion', icon: 'copy'}, {type: 'ion', icon: 'download'},
		{type: 'ion', icon: 'time'},{type: 'ion', icon: 'cog'},{type: 'ion', icon: 'person-circle'},{type: 'ion', icon: 'people-circle'},
		{type: 'ion', icon: 'desktop'},{type: 'ion', icon: 'flower'},{type: 'ion', icon: 'images'},{type: 'ion', icon: 'information-circle'},
		{type: 'ion', icon: 'key'},{type: 'ion', icon: 'keypad'},{type: 'ion', icon: 'lock-closed'},{type: 'ion', icon: 'lock-open'},{type: 'ion', icon: 'map'},
		{type: 'ion', icon: 'partly-sunny'}, {type: 'ion', icon: 'pin'},
		{type: 'ion', icon: 'cloudy'}, {type: 'ion', icon: 'thunderstorm'}, {type: 'ion', icon: 'cloudy-night'}, {type: 'ion', icon: 'moon'},
		{type: 'ion', icon: 'rainy'},{type: 'ion', icon: 'sunny'},{type: 'ion', icon: 'snow'},{type: 'ion', icon: 'power'},{type: 'ion', icon: 'radio'},
		{type: 'ion', icon: 'toggle'},{type: 'ion', icon: 'trash'},{type: 'ion', icon: 'logo-windows'},{type: 'ion', icon: 'add-circle'},
		{type: 'ion', icon: 'checkmark-circle'},{type: 'ion', icon: 'close-circle'}, {type: 'ion', icon: 'walk'}, {type: 'ion', icon: 'play'}, {type: 'ion', icon: 'pause'},
		{type: 'ion', icon: 'square'}, {type: 'ion', icon: 'play-forward'}, {type: 'ion', icon: 'play-skip-forward'}, {type: 'ion', icon: 'play-back'}, {type: 'ion', icon: 'play-skip-back'},
		{type: 'ion', icon: 'shuffle'}, {type: 'ion', icon: 'repeat'}, {type: 'ion', icon: 'volume-high'}, {type: 'ion', icon: 'volume-low'}, {type: 'ion', icon: 'volume-medium'}, 
		{type: 'ion', icon: 'volume-mute'}, {type: 'ion', icon: 'volume-off'}, 
		// Font Awesome
		{type: 'fas', icon: 'ellipsis-h'}, {type: 'fas', icon: 'angle-double-up'},
		{type: 'fas', icon: 'angle-double-down'}, {type: 'fas', icon: 'angle-double-left'},
		{type: 'fas', icon: 'angle-double-right'}, {type: 'fas', icon: 'bus'},
		{type: 'fas', icon: 'calendar'}, {type: 'fas', icon: 'calendar-alt'},
		{type: 'fas', icon: 'calendar-check'}, {type: 'fas', icon: 'door-open'},
		{type: 'fas', icon: 'door-closed'}, {type: 'fas', icon: 'fan'},
		{type: 'fas', icon: 'lightbulb'}, {type: 'fas', icon: 'thermometer-empty'},
		{type: 'fas', icon: 'thermometer-half'}, {type: 'fas', icon: 'thermometer-full'},
		{type: 'fas', icon: 'temperature-low'}, {type: 'fas', icon: 'temperature-high'},
		{type: 'fas', icon: 'window-restore'}, {type: 'fas', icon: 'clipboard'},
		{type: 'fas', icon: 'clipboard-check'}, {type: 'fas', icon: 'clipboard-list'},
		{type: 'fas', icon: 'paste'}, {type: 'fas', icon: 'object-group'},
		{type: 'fas', icon: 'object-ungroup'}, {type: 'fas', icon: 'file-export'},
		{type: 'fas', icon: 'file-import'}, {type: 'fas', icon: 'dog'},
		{type: 'fas', icon: 'paw'}, {type: 'fas', icon: 'bone'},
		{type: 'fas', icon: 'plug'}, {type: 'fas', icon: 'solar-panel'},
		{type: 'fas', icon: 'leaf'}, {type: 'fas', icon: 'seedling'}, 
		{type: 'fas', icon: 'water'}, {type: 'fas', icon: 'faucet'},
		{type: 'fas', icon: 'swimming-pool'}, {type: 'fas', icon: 'shower'},
		{type: 'fas', icon: 'tint'}
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
	private customColors: string[] = [];

	// app modes
	public modes: any = {
		// indicated edit mode
		roomEdit: false,
		// indicates who initiated editing
		roomEditFrom: null,
		// events
		fhemMenuMode: '',
		// loader
		showLoader: false
	};
	// subscriber for modes
	public modeSub = new Subject<any>();

	// app error events -- for export to file
	public log: Array<any> = [];

	// app defaults
	public appDefaults:Array<AppSetting> = [
		// Theme of the App
		{name: 'theme', default: 'dark', toStorage: true},
		// Custom color theming colors
		{name: 'customTheme', default: JSON.stringify({primary: '#18252B', secondary: '#0A0F12', text: '#fff', des: '#d4d4d4'}), toStorage: true},
		// allow toast messages
		{name: 'showToastMessages', default: true, toStorage: true},
		// responsive resizing to size components
		{name: 'responsiveResize', default: false, toStorage: true},
		// update checking from github
		{name: 'checkUpdates', default: false, toStorage: true},
		// enable room and component editing
		{name: 'enableEditing', default: true, toStorage: true},
		// undo and redo 
		{name: 'enableUndoRedo', default: false, toStorage: true},
		// task service 
		{name: 'showTasks', default: false, toStorage: true},
		// keep fhem connection alive
		{name: 'keepConnected', default: false, toStorage: true},
		// logging
		{name: 'enableLog', default: false, toStorage: true},
		// grid to move components
		{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20}), toStorage: true},
		// haptic feedback on events
		{name: 'hapticFeedback', default: JSON.stringify({enable: false, duration: 1}), toStorage: true},
		// acustic feedback on events
		{name: 'acusticFeedback', default: JSON.stringify({enable: false, audio: '1'}), toStorage: true},
		// which devices to load from fhem --> component devices or all --> support end for fhem defined
		{name: 'fhemDeviceLoader', default: 'Component', toStorage: true},
		// custom component colors 
		{name: 'customColors', default: JSON.stringify([]), toStorage: false, callback: (data:any)=>{if(data.length > 0){this.componentColors = this.componentColors.concat(data)}}},
		// app language
		{name: 'language', default: 'en', toStorage: true, callback: (lang:any)=> {this.translate.setDefaultLang(lang || 'en');}},
		// fhem connection profiles
		{name: 'connectionProfiles', default: JSON.stringify([]), toStorage: false, callback: (data)=>{if(data.length === 0){ this.connectionProfiles = [{IP: '', PORT: '8080', WSS: false, type: 'Websocket', basicAuth: false, USER: '', PASSW: ''}]; this.modes.fhemMenuMode = 'ip-config' }}}
	];

	constructor(
		private storage: StorageService,
		private translate: TranslateService,
		private library: FaIconLibrary){
		// listen to mode changes
		this.modeSub.subscribe(next => {
			for (const [key, value] of Object.entries(next)) {
				this.modes[key] = value;
			}
		});
		// Add FontAwesome Icons to library
		library.addIcons(
			faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight, faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck,
			faDoorOpen, faDoorClosed, faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, faThermometerFull, faTemperatureLow, faTemperatureHigh, faWindowRestore,
			faClipboardCheck, faClipboard, faClipboardList, faPaste, faObjectGroup, faObjectUngroup, faFileExport, faFileImport, faDog, faPaw, faBone, faPlug, faSolarPanel,
			faLeaf, faSeedling, faWater, faFaucet, faSwimmingPool, faShower, faTint
		);
	}

	// load app defaults
	public loadDefaults(){
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
						this[setting.name] = res;
					}
					// check if new props added to a json setting
					if(this.testJSON(setting.default)){
						// default json options detected
						const jsonSetting: Object = JSON.parse(setting.default);
						let newProperties: boolean = false;
						for (const [key, value] of Object.entries(jsonSetting)) {
							if(res[key] === undefined){
								// new property found
								newProperties = true;
								if(setting.toStorage){
									this.app[setting.name][key] = value;
								}else{
									this[setting.name][key] = value;
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
									change: JSON.stringify(this[setting.name])
								});
							}
						}
					}
					// determine callbacks
					if(setting.callback){
						setting.callback( (setting.toStorage ? this.app[setting.name] : this[setting.name]) );
					}
					//
					if(index === this.appDefaults.length -1){
						// IP
						resolve();
					}
				});
			});
		});
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
							if(!this.componentColors.includes(singleValue) && !newColors.includes(singleValue) && this.checkValidHex(singleValue)){
								newColors.push(singleValue);
							}
						});
					}else{
						if(!this.componentColors.includes(attr.value) && !newColors.includes(attr.value) && this.checkValidHex(attr.value)){
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

	// test for json
	private testJSON(str) {
		try { JSON.parse(str); } catch (e) { return false; }
		return true;
	}

	// check valid hex codes
	public checkValidHex(str){
		return (/^#([0-9A-F]{3}){1,2}$/i).test(str);
	}
}