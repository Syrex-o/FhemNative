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

/**
 * Create date string for naming
 * @returns 
 */
export function getFileDate(): string{
	const padL = (nr: number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
	const dt = new Date();
	return `${padL(dt.getMonth()+1)}/${padL(dt.getDate())}/${dt.getFullYear()} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`;
}

// get percentage of value
export function getValuePercentage(value: number, min: number, max: number): number{
	let v = (value - min) / (max - min);
	if(v >= 1) v = 1;
	if(v <= 0) v = 0;

	return v;
}

export function toValueNumber(factor: number, min: number, max: number, step: number): number {
	return Math.round(factor * (max - min) / step) * step + min;
}

export function restrictToRange(val: number, min: number, max: number): number{
	if (val < min) return min;
	if (val > max) return max;
	return val;
}

export function animateMove(fromNum: number, toNum: number, cb: (val: number)=> void): void{
	let interval: any;
	let pos = fromNum;
	const orginalValue = toNum;

	const frame = ()=>{
		const count = (pos > toNum) ? - 1 : 1;
		interval = setInterval(()=>{
			if ( Math.round(pos) === Math.round(toNum)  ) {
				cb(orginalValue);
				clearInterval(interval);
			}else{
				pos = parseFloat( (pos + count).toFixed(1) );
				cb(pos);
			}
		}, 5);
	}
	frame();
}