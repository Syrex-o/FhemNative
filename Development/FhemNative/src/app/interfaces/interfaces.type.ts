// reusable interfaces

// FHEM device
export interface FhemDevice {
	id: number,
	device: string,
	readings: any,
	internals: any,
	attributes: any
}

// Get Settings of a component
export interface ComponentSettings {
	name: string,
	type: string,
	container?: string,
	inputs: Array<object>,
	dependencies?: ComponentDependencies,
	customInputs?: CustomComponentInputs
	dimensions?: { minX: number, minY: number}
}

// Dynamic component
export interface DynamicComponent {
	name: string,
	path: string
}

// full defined component
export interface DynamicComponentDefinition {
	ID?: string,
	name: string,
	type?: string,
	container?: string,
	pinned?: boolean,
	attributes: ComponentAttributes,
	position?: {
		top: string, 
		left: string, 
		width: string,
		height: string,
		zIndex: number
	},
	dimensions?: { minX: number, minY: number},
	createScaler?: {width: number, height: number},
	dependencies?: ComponentDependencies,
	customInputs?: CustomComponentInputs
}

// dynamic component attributes
export interface ComponentAttributes {
	attr_data?: Array<{attr: string, value: string}>,
	attr_style?: Array<{attr: string, value: string}>,
	attr_bool_data?: Array<{attr: string, value: boolean}>,
	attr_arr_data?: Array<{attr: string, value: any, defaults?: string[]}>,
	attr_arr_style?: Array<{attr: string, value: string[]}>,
	attr_icon?: Array<{attr: string, value: string}>,
	attr_arr_icon?: Array<{attr: string, value: string[]}>,
	// container components
	components?: any
}

// component dependencies in creation and edit menu
export interface ComponentDependencies {
	[key: string]: {dependOn: string, value: boolean|string|string[]}
}

// additional custom inputs
export interface CustomComponentInputs {
	[key: string]: any
}

// Structure Room
export interface Room {
	ID: number,
	name: string,
	icon: string,
	UID: string,
	components: Array<any>,
	useRoomAsGroup?: boolean,
	groupRooms?:Array<any>,
	groupComponents?: Object
}

export interface RoomParams {
	name: string,
	ID: number,
	UID: string,
	reload?: boolean
}