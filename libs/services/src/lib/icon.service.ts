import { Injectable } from '@angular/core';
// Font Awesome Icons
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
	faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, faAngleDoubleRight,
	faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck, faDoorOpen, faDoorClosed,
	faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, faThermometerFull,
	faTemperatureLow, faTemperatureHigh, faWindowRestore, faClipboardCheck, faClipboard, 
	faClipboardList, faPaste, faObjectGroup, faObjectUngroup, faFileExport, faFileImport,
	faDog, faPaw, faBone, faPlug, faSolarPanel, faLeaf, faSeedling, faWater, faFaucet, faSwimmingPool, faShower,
	faTint, faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

// relevant icon categories and references
export const ICON_CATEGORIES = {
	ion: { name: 'Ionicons', ref: 'https://ionic.io/ionicons' },
	fas: { name: 'FontAwesome', ref: 'https://fontawesome.com/search?o=r&m=free&s=solid' },
	mdi: { name: 'Material Design Icons', ref: 'https://pictogrammers.com/library/mdi/' },
	knx: { name: 'KNX UF Icons', ref: 'https://github.com/OpenAutomationProject/knx-uf-iconset/tree/master' }
} as const;

export type IconType = keyof typeof ICON_CATEGORIES;

export interface Icon {
	type: IconType,
	icon: string
}

@Injectable({providedIn: 'root'})
export class IconService {

    constructor(library: FaIconLibrary){

        // Add FontAwesome Icons to library
		library.addIcons(
			faEllipsisH, faAngleDoubleDown, faAngleDoubleUp, faAngleDoubleLeft, 
            faAngleDoubleRight, faBath, faBus, faCalendar, faCalendarAlt, faCalendarCheck,
			faDoorOpen, faDoorClosed, faFan, faLightbulb, faThermometerEmpty, faThermometerHalf, 
            faThermometerFull, faTemperatureLow, faTemperatureHigh, faWindowRestore,
			faClipboardCheck, faClipboard, faClipboardList, faPaste, faObjectGroup, 
            faObjectUngroup, faFileExport, faFileImport, faDog, faPaw, faBone, faPlug, faSolarPanel, 
            faLeaf, faSeedling, faWater, faFaucet, faSwimmingPool, faShower, faTint, faPaperPlane
		);
    }

	// list of available Icons
	public icons: Icon[] = [

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
		{type: 'ion', icon: 'square'}, {type: 'ion', icon: 'play-forward'}, {type: 'ion', icon: 'play-skip-forward'}, {type: 'ion', icon: 'play-back'}, 
		{type: 'ion', icon: 'play-skip-back'}, {type: 'ion', icon: 'shuffle'}, {type: 'ion', icon: 'repeat'}, {type: 'ion', icon: 'volume-high'}, 
		{type: 'ion', icon: 'volume-low'}, {type: 'ion', icon: 'volume-medium'}, {type: 'ion', icon: 'volume-mute'}, {type: 'ion', icon: 'volume-off'},

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
		{type: 'fas', icon: 'file-import'}, {type: 'fas', icon: 'paper-plane'}, {type: 'fas', icon: 'dog'},
		{type: 'fas', icon: 'paw'}, {type: 'fas', icon: 'bone'},
		{type: 'fas', icon: 'plug'}, {type: 'fas', icon: 'solar-panel'},
		{type: 'fas', icon: 'leaf'}, {type: 'fas', icon: 'seedling'}, 
		{type: 'fas', icon: 'water'}, {type: 'fas', icon: 'faucet'},
		{type: 'fas', icon: 'swimming-pool'}, {type: 'fas', icon: 'shower'},
		{type: 'fas', icon: 'tint'},

		// MDI
		{type: 'mdi', icon: 'window-open-variant'}, {type: 'mdi', icon: 'window-closed-variant'},
		{type: 'mdi', icon: 'roller-shade'}, {type: 'mdi', icon: 'roller-shade-closed'},
		{type: 'mdi', icon: 'curtains'}, {type: 'mdi', icon: 'curtains-closed'},

		// KNX UF
		{type: 'knx', icon: 'fts_door_locked'}, {type: 'knx', icon: 'fts_door_open'},
		{type: 'knx', icon: 'fts_door_opener_key'}, {type: 'knx', icon: 'fts_door_slide_open'},
		{type: 'knx', icon: 'fts_door_slide'}, {type: 'knx', icon: 'fts_door_tilt'},
		{type: 'knx', icon: 'fts_door_unlocked'}, {type: 'knx', icon: 'fts_door'},
		{type: 'knx', icon: 'fts_shutter_10'}, {type: 'knx', icon: 'fts_shutter_20'},
		{type: 'knx', icon: 'fts_shutter_30'}, {type: 'knx', icon: 'fts_shutter_40'},
		{type: 'knx', icon: 'fts_shutter_50'}, {type: 'knx', icon: 'fts_shutter_60'},
		{type: 'knx', icon: 'fts_shutter_70'}, {type: 'knx', icon: 'fts_shutter_80'},
		{type: 'knx', icon: 'fts_shutter_90'}, {type: 'knx', icon: 'fts_shutter_100'},
		{type: 'knx', icon: 'fts_shutter_attention'}, {type: 'knx', icon: 'fts_shutter_automatic'},
		{type: 'knx', icon: 'fts_shutter_down'}, {type: 'knx', icon: 'fts_shutter_jam'},
		{type: 'knx', icon: 'fts_shutter_locked'}, {type: 'knx', icon: 'fts_shutter_manual'},
		{type: 'knx', icon: 'fts_shutter_stop'}, {type: 'knx', icon: 'fts_shutter_unlocked'},
		{type: 'knx', icon: 'fts_shutter_up'}, {type: 'knx', icon: 'fts_shutter_vert_automatic'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_00'}, {type: 'knx', icon: 'fts_shutter_vert_blade_10'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_20'}, {type: 'knx', icon: 'fts_shutter_vert_blade_30'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_40'}, {type: 'knx', icon: 'fts_shutter_vert_blade_50'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_60'}, {type: 'knx', icon: 'fts_shutter_vert_blade_70'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_80'}, {type: 'knx', icon: 'fts_shutter_vert_blade_90'},
		{type: 'knx', icon: 'fts_shutter_vert_blade_100'}, {type: 'knx', icon: 'fts_shutter_vert_down'},
		{type: 'knx', icon: 'fts_shutter_vert_manual'}, {type: 'knx', icon: 'fts_shutter_vert_up'},
		{type: 'knx', icon: 'fts_shutter_vert'}, {type: 'knx', icon: 'fts_shutter'},
		{type: 'knx', icon: 'fts_window_1w_locked'}, {type: 'knx', icon: 'fts_window_1w_open'},
		{type: 'knx', icon: 'fts_window_1w_tilt'}, {type: 'knx', icon: 'fts_window_1w_unlocked'},
		{type: 'knx', icon: 'fts_window_1w'},
	];
	
	// search for icon
	public findIcon(name: string): Icon|undefined{
		return this.icons.find(((x: {icon: string, type: string})=> x.icon === name));
	}
}