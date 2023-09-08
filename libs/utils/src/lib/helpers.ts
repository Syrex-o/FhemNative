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
 * Chech if mouse move delta is smaller then limit
 * @param delta 
 * @param limiter 
 * @returns 
 */
export function deltaMovedLimit(delta: {x: number, y: number}, limiter: number): boolean{
	return Math.abs(delta.x) <= limiter && Math.abs(delta.y) <= limiter;
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
 * Check for number input or get default number back
 * @param val
 * @param defaultNumber 
 * @returns 
 */
export function getNumberOrDefault(val: any, defaultNumber: number): number{
	return isNaN(val) ? defaultNumber : val;
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

function getAnimationStep(fromNum: number, toNum: number, step: number): number{
	return step * (fromNum > toNum ? -1 : 1);
}

export function animateMove(fromNum: number, toNum: number, cb: (val: number)=> void): void{
	let interval: any;
	let pos = fromNum;
	const orginalValue = toNum;

	const maxSteps = 60;
	const delta = Math.max(fromNum, toNum) - Math.min(fromNum, toNum);

	const stepCount = Math.floor(delta / Math.min(delta, maxSteps));
	let countDirection = getAnimationStep(pos, toNum, stepCount);

	const frame = ()=>{
		interval = setInterval(()=>{
			const restDelta = Math.max(pos, toNum) - Math.min(pos, toNum);
			// reduce counter at end
			if(restDelta <= stepCount && stepCount !== 1) countDirection = getAnimationStep(pos, toNum, 1);

			if ( Math.round(pos) === Math.round(toNum)  ) {
				cb(orginalValue);
				clearInterval(interval);
			}else{
				pos = parseFloat( (pos + countDirection).toFixed(1) );
				cb(pos);
			}
		}, 5);
	}
	frame();
}

export function toTitleCase(text: string){
	return text.toLowerCase()
		.split(' ')
    	.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    	.join(' ');
}

/**
 * Get Array in chunks
 * @param arr 
 * @param chunkSize 
 * @returns 
 */
export function getArrayInChunks(arr: any[], chunkSize: number){
	const chunks = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunks.push( arr.slice(i, i + chunkSize) )
	}
	return chunks;
}

/**
 * Create awitable delay
 * @param time 
 * @returns 
 */
export function getDelay(time: number){
	return new Promise(resolve => setTimeout(resolve, time));
}

export function inputIsNotNullOrUndefined<T>(input: null | undefined | T): input is T {
	return input !== null && input !== undefined;
}