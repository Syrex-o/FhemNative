import { Injectable } from "@angular/core";

import { SettingsService } from '../settings.service';

// Themes
import { Theme, dark, darkAlter, bright } from './themes';

@Injectable({
	providedIn: "root"
})
export class ThemeService {
	private active: Theme = dark;
	private availableThemes: Theme[] = [dark, darkAlter, bright];

	constructor(private settings: SettingsService){}

	// change global app theme
	public changeTheme(theme: string): void{
		const actualTheme: Theme|undefined = this.availableThemes.find(x=> x.name === theme);
		if(actualTheme){
			// change active theme
			this.active = actualTheme;
			// change vaiables
			Object.keys(this.active.properties).forEach(property => {
				document.documentElement.style.setProperty(property, this.active.properties[property]);
			});
		}
		else if(theme === 'custom'){
			this.customThemeLoader();
		}
	}

	// load custom theme options
	private customThemeLoader(): void{
		// constists of: primary, secondary, text, des
		document.documentElement.style.setProperty('--primary', this.settings.app.customTheme.primary);
		document.documentElement.style.setProperty('--secondary', this.settings.app.customTheme.secondary);
		document.documentElement.style.setProperty('--text', this.settings.app.customTheme.text);
		document.documentElement.style.setProperty('--des', this.settings.app.customTheme.des);

		// assign rest from dark
		document.documentElement.style.setProperty('--shadow-one', dark.properties['--shadow-one']);
		document.documentElement.style.setProperty('--shadow-two', dark.properties['--shadow-two']);
	}
}