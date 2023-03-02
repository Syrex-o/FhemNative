// reusable interfaces

// FHEM device
export interface FhemDevice {
	id: number,
	device: string,
	readings: any,
	internals: any,
	attributes: any
}

// App Setting
export interface AppSetting {
	name: string,
	default: any,
	toStorage: boolean,
	callback?: (data:any)=> any
}

// Storage Setting
export interface StorageSetting {
	name: string,
	default?: any,
	change?: any
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

// Room Interfaces
// Structure Room
export interface Room {
	ID: number,
	name: string,
	icon: string,
	UID: string,
	components: Array<any>,
	useRoomAsGroup?: boolean,
	groupRooms?:Array<any>,
	groupComponents?: any,
	// color
	color?: string
}

// Route params of room
export interface RoomParams {
	name: string,
	ID: number,
	UID: string,
	reload?: boolean,
	// used to trigger reload --> when room not switched, but reload should be triggerd
	reloadID?: string
}

// Component Interfaces
// Positioning
export interface ComponentPosition {
	top: string,
	left: string,
	width: string,
	height: string,
	zIndex: number,
	rotation: string
}

// elem pos in directives
export interface ElementPosition {
	top: number,
	left: number,
	width: number,
	height: number
}

// elem pos in directives string 
export interface ElementPositionString {
	top: string,
	left: string,
	width: string,
	height: string
}

// Full defined component
export interface DynamicComponentDefinition {
	ID?: string,
	name: string,
	type?: string,
	container?: string,
	pinned?: boolean,
	attributes: ComponentAttributes,
	position?: ComponentPosition,
	position_P?: ComponentPosition,
	dimensions?: { minX: number, minY: number},
	createScaler?: {width: number, height: number},
	dependencies?: ComponentDependencies,
	customInputs?: CustomComponentInputs
}

// Full component position in room definition
export interface ComponentInStructure {
	component: DynamicComponentDefinition,
	room: string,
	roomID: string
}

// Dynamic component attributes
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

// Component dependencies in creation and edit menu
export interface ComponentDependencies {
	[key: string]: {dependOn: string|string[], value: boolean|string|string[]|boolean[]}
}

// additional custom inputs
export interface CustomComponentInputs {
	[key: string]: any
}

// FhemNative Tasks
export interface TaskProperty {
	variable: string, 
	value: any
}

export interface Compare {
	variable: string, 
	value: any
}

export interface CodeBlock {
	name: string,
	inputs?: Array<TaskProperty>,
	compare?: Compare,
	output: TaskProperty[]|TaskProperty
}

export interface TaskInput {
	name: string,
	inputs?: TaskProperty[],
	operators: Array<string>,
	operatorParam?: string,
	operatorValues?: Array<string>
}

export interface Task {
	ID: string,
	attributes: {
		IF?: CodeBlock,
		ELSE?: CodeBlock
	},
	name: string,
	description: string
}

// FhemNative Variables
export interface Variable {
	ID: string,
	// syntax to call
	defSyntax: string,
	name: string,
	description: string,
	// variable attributes
	attributes: {
		// static/dynamic
		type?: string,
		// variable inputs
		inputOption?: any,
		// variable update options
		updateOption?: any,
		// regex variable options
		regexOption?: any
	},
	// raw value
	rawValue?: any,
	// desired value
	modValue?: any
}