// FHEM helper functions

/**
 * Transform comma separated string to list
 * Result does not include spaces
 * @param val comma separated string
 * @returns 
 */
export function commaListToArray(val: string): string[] {
    return val.split(' ').join('').split(',');
}