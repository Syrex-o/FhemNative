import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";

// Themes
import { dark, bright } from './themes';
import { CssVariableService } from "../cssVariable.service";

import { Theme } from "@fhem-native/types/common";

@Injectable({
	providedIn: "root"
})
export class ThemeService {
	private availableThemes: Theme[] = [dark, bright];
	private active = new BehaviorSubject<Theme>(dark);

	constructor(private cssServive: CssVariableService){}

	// change global app theme
	public changeTheme(theme: string): void{
		const actualTheme = this.availableThemes.find(x=> x.name === theme);
		if(!actualTheme) return;

		// change active theme
		this.active.next(actualTheme);
		// change vaiables
		Object.keys(this.active.value.properties).forEach(property => {
			this.cssServive.changeVariableValue(property, this.active.value.properties[property]);
		});
	}

	// observalble of active theme
	public getTheme(): Observable<Theme> { return this.active; }

	// pipe of theme
	public getThemePipe(themeValue: string): Observable<string> {
		return this.active.pipe( map( x=> x.properties[themeValue] ) );
	}

    // get value from theme
    public getThemeColor(themeValue: string): string{
        const color = this.active.value.properties[themeValue];
		return color.substring(0,1) === '#' ? color : this.rgbToHex(color);
    }

	private componentFromStr(numStr: string, percent: string) {
		const num = Math.max(0, parseInt(numStr, 10));
		return percent ? Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
	}

	private rgbToHex(rgb: string) {
		const rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
		let result, r, g, b, hex = "";
		if ( (result = rgbRegex.exec(rgb)) ) {
			r = this.componentFromStr(result[1], result[2]);
			g = this.componentFromStr(result[3], result[4]);
			b = this.componentFromStr(result[5], result[6]);
	
			hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
		}
		return hex;
	}
}