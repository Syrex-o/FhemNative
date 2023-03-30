import { Room } from "@fhem-native/types/room";
import { AppSetting } from "@fhem-native/types/storage"; 
import { ConnectionProfile } from "@fhem-native/types/fhem";

/**
 * Language Options
 */
export const LangOptions = ['de', 'en'];

/**
 * Theme Options
 */
export const ThemeOptions = ['bright', 'dark'];

/*
    Different connection types
*/
export const ConnectionTypes = [
    { value: 'fhemweb', display: 'Fhemweb' },
    // { value: 'websocket', display: 'Websocket' }
];

/*
	Default Connection Profile	
*/
export const DefaultConnectionProfile: ConnectionProfile = {
	IP: '', PORT: '8083', WSS: false,
	type: ConnectionTypes[0].value,
	basicAuth: false, USER: '', PASSW: ''
}

/*
    Base Component Colors
*/
export const ComponentColors = [
    '#fbfbfb', '#86d993', '#fb0a2a', '#02adea',
	'#00405d', '#ffcc33', '#ff6138', '#ff0000',
	'#fcd20b', '#e47911', '#a4c639', '#7fbb00',
	'#0060a3', '#1d8dd5', '#003366', '#005cff',
	'#97b538', '#272727', '#2ec6ff', '#434E5D',
	'#58677C', '#58677c', '#14a9d5', '#2994b3',
	'#a2a4ab', '#FF0909', '#F3481A', '#FABA2C',
	'#232524', '#00BCF2', '#ddd', '#fff', '#000', 
	'transparent'
];

/*
    Base App Settings
*/
export const BaseAppSettings: AppSetting[] = [
    // Theme of the App
	{name: 'theme', default: 'dark', toStorage: true},
	// toast messages
	{name: 'allowToasts', default: false, toStorage: true},
	// editing
	{name: 'allowEditing', default: true, toStorage: true},
    // grid to move components
	{name: 'grid', default: JSON.stringify({enabled: true, gridSize: 20}), toStorage: true},
]

/**
	Default Room
*/
export const DefaultRoom: Room = {
	ID: 0, UID: '_s01tz3k9x',
	name: 'Home', icon: 'home', 
	components: []
}

/**
 * Default component Type icons + style
 */
export const ComponentTypes = {
	fhem: {icon: 'options-outline', color: '#57bef4'},
	style: {icon: 'color-palette-outline', color: '#f3b286'},
	container: {icon: 'cube-outline', color: '#309f8a'}
}