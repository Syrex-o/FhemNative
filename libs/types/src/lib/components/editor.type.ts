import { Type } from "@angular/core"
import { BaseComponentPosition } from "./core.type"
import { ComponentSettings } from "./settings.type"

/**
 * Main Editor
 */
export interface EditMode {
    edit: boolean,
    editComponents: boolean,
    editFrom: string|null
}

/**
 * Component Editor
 */
export interface ComponentEditor {
    edit: boolean,
    componentUID: string|null,
    containerId: string|null,
}

/**
 * Component config editor
 */
export interface ComponentConfigEditor {
    new: Type<any>|null,
    componentConfig: ComponentSettings|null
}

/**
 * move/scale EventEmitter
 */
export interface ComponentTransformation {
	componentUID: string,
	containerUID: string,
	position: BaseComponentPosition
}

/**
 * Context Menu Creation Properties
 */
export interface ConextMenuProbs {
    source: ConextMenuSource,
	componentId?: string,
	transformationManager: any
}

export declare type ConextMenuSource = 'component'|'grid';