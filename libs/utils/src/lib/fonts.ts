// font helper functions

/**
 * Transform font string to number
 * @param selection 
 * @returns font weight
 */
export function getFontWeightFromSelection(selection: TextStyle): number{
	if(['thin', 'thin-italic'].includes(selection)) return 100;
	else if(['bold', 'bold-italic'].includes(selection)) return 600;
	return 400;
}

/**
 * Font style to font reference
 * @param from 
 * @returns font styling
 */
export function getFontStyleFromSelection(from: TextStyle): string{
	return from.indexOf('italic') > -1 ? 'italic': 'normal';
}

// font style variations
export declare type TextStyle = 'normal'|'thin'|'italic'|'bold'|'thin-italic'|'bold-italic';