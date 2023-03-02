import { BaseComponentPosition } from "./core.type"

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