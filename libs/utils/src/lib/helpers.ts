// get mouse position
export function getMousePosition(e: any): {x: number, y: number}{
	return {
		x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
		y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
	};
}

// get mouse delta
export function getMouseDelta(start: {x: number, y: number}, e: any): {x: number, y: number}{
	const current: {x: number, y: number} = getMousePosition(e);
	return {
		x: current.x - start.x,
		y: current.y - start.y
	}
}

/**
 * Round decimal to certain point
 * decimalRounder(2.74, 0.1) = 2.7
 * decimalRounder(2.74, 0.25) = 2.75
 * decimalRounder(2.74, 0.5) = 2.5
 * decimalRounder(2.74, 1.0) = 3.0
 * @param value current number
 * @param step stepper
 * @returns rounded number
 */
export function decimalRounder(value: number, step: number) {
	const inv = 1.0 / step;
	return Math.round(value * inv) / inv;
}

/**
 * Get value of object, by string reference (Exp. 'name.first' for: { name: { first: 'Neo' } }; )
 * @param obj Object to search
 * @param path dot seperated string path
 * @returns Object result
 */
export const leaf = (obj: Record<string, any>, path: string): any => (path.split('.').reduce((value, el) => value[el], obj))

/**
 * Deep clone object
 * No Regex or function cloning
 * @param obj 
 * @returns 
 */
export function clone(obj: any): any{
	let result = obj;
	const type = {}.toString.call(obj).slice(8, -1);
	if (type == 'Set') {
		return new Set([...obj].map(value => clone(value)));
	}
	if (type == 'Map') {
		return new Map([...obj].map(kv => [clone(kv[0]), clone(kv[1])]));
	}
	if (type == 'Date') {
		return new Date(obj.getTime());
	}
	if (type == 'Array' || type == 'Object') {
		result = Array.isArray(obj) ? [] : {};
		for (const key in obj) {
		// include prototype properties
		result[key] = clone(obj[key]);
		}
	}
	// primitives and non-supported objects (e.g. functions) land here
	return result;
}

/**
 * Test for JSON
 * @param str test val
 */
export function IsJsonString(str: any): boolean {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}