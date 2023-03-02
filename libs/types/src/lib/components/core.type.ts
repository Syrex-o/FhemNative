/**
 * Component Position Data
 */
export interface BaseComponentPosition {
	top: string,
	left: string,
	width: string,
	height: string
}

export interface ComponentPosition extends BaseComponentPosition{
	zIndex: number
}