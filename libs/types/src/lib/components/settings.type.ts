// Component Settings interfaces
import { ComponentPosition } from "./core.type"

// Component dependencies in creation and edit menu
export interface ComponentDependency {
	dependOn: string[], 
	value: Array<boolean|string>
}

/**
 * Cdditional Component Inputs
 */
export interface CustomComponentInputs {
	[key: string]: string
}

export interface ComponentDimensions {
	minX: number, minY: number
}

/**
 * Component Settings
 */
export interface BaseComponentSettings{
	readonly name: string,
	customInputs?: CustomComponentInputs
}

/**
 * Defines how component Settings are defined in file
 */
export interface ComponentSettings extends BaseComponentSettings{
	readonly type: 'fhem'|'style'|'container',
	readonly dimensions: ComponentDimensions,
	inputs: {
		data: Record<string, any>,
		bool?: Record<string, any>,
		arr_data?: Record<string, any>,
		icon?: Record<string, any>,
		style?: Record<string, any>,
		arr_icon?: Record<string, any>,
		arr_style?: Record<string, any>,
		arr_style_grad?: Record<string, any>
	},
	dependencies?: Record<string, ComponentDependency>
}

// nested components inside container
export interface FhemComponentContainerSettings {
	containerUID: string,
	components: FhemComponentSettings[]
}

/**
 * Defines how component Settings are defined in storage/display
 */
export interface FhemComponentSettings extends BaseComponentSettings{
	UID: string,
	position: ComponentPosition,
	inputs: Record<string, any>,
	components?: FhemComponentContainerSettings[]
}