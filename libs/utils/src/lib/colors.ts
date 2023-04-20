// color helper functions

export function hexToRGB(hex: string) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

export function hexToHSL(hex: string): number[]{
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	if(!result) return [0, 0, 0];
	
	let r = parseInt(result[1], 16);
	let g = parseInt(result[2], 16);
	let b = parseInt(result[3], 16);

	r /= 255, g /= 255, b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h = 0, s: number, l: number = (max + min) / 2;
	if(max == min){
		h = s = 0;
	}else{
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	s = Math.round(s*100), l = Math.round(l*100), h = Math.round(h*360);
	return [h,s,l];
}

export function RGBToHex(rgb: any) {
	if (Array.isArray(rgb)) return ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
	
	const RGB: number[] = (rgb.split('(')[1].split(')')[0]).split(',');
	return ((1 << 24) + (RGB[0] << 16) + (RGB[1] << 8) + RGB[2]).toString(16).slice(1);
}

export function HSLToRGB(hsl: number[]): number[]{
	const h = hsl[0], s = hsl[1] / 100, l = hsl[2] / 100;

	const a = s * Math.min(l,1-l);
	const f = (n: number, k=(n+h/30)%12) => l - a * Math.max(Math.min(k-3,9-k,1),-1); 
	return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]; 
}

export function colorSelector(from: ColorStyle, to: ColorStyle, value: any): any {
	if(from === to) return value;

	if(from === 'hex'){
		if(to === '#hex') return '#' + value;
		if(to === 'rgb') return hexToRGB(value);
		if(to === 'hsl') return hexToHSL(value);
	}

	if(from === 'rgb') {
		if(to === 'hex' || to === '#hex') return (to === 'hex') ? RGBToHex(value) : '#' + RGBToHex(value);
	}

	if (from === '#hex'){
		if (to === 'hex') return (value as string).substring(1);
	}

	if (from === 'hsl'){
		if (to === 'rgb') return HSLToRGB(value);
	}
}

/**
 * Get Css gradient from color array
 * @param colorArr list of colors
 * @returns string of linear gradient
 */
export function getCssGradient(colorArr: string[]): string{
	if(colorArr.length === 0) return 'rgba(0, 0, 0, 0)';

	// add initial stop
	const gradient = [ (colorArr[0] + ' 0%') ];

	// get stops
	let colorStops = 0.5;
	if(colorArr.length > 2){
		colorStops = Math.round( ((1 / (colorArr.length -1)) + Number.EPSILON) * 100 ) / 100;
	}
	// add stops
	for(let i = 1; i <= colorArr.length -2; i++){
		gradient.push( `${colorArr[i]} ${(i * colorStops) * 100}%` );
	}
	// add last stop
	gradient.push( `${colorArr[colorArr.length -1]} 100%` );

	return `linear-gradient(90deg, ${gradient.join(', ')})`;
}

/**
 * Check string for valid hex
 * @param str 
 * @returns 
 */
export function isValidHex(str: string): boolean{
	return (/^#([0-9A-F]{3}){1,2}$/i).test(str);
}

// color style variations
export declare type ColorStyle = 'hex'|'#hex'|'rgb'|'hsl';