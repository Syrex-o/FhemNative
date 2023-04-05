import { Component } from '@angular/core';

import { SettingsService, StorageService, ThemeService } from '@fhem-native/services';
import { WebsettingsService } from './shared/services/webSettings.service';
import { NAV_ITEMS } from './shared/app-config';

@Component({
	selector: 'fhem-native-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	navItems = NAV_ITEMS;

	constructor(
		private theme: ThemeService,
		private storage: StorageService,
		private settings: SettingsService,
		private webSettings: WebsettingsService){
		// initialize app
		this.initializeApp();
	}

	private async initializeApp(): Promise<void>{
		// initialize storage
		await this.storage.initStorage();
		// Load App Defaults
		await this.settings.loadDefaults();
		// adjust theme
		this.theme.changeTheme(this.settings.app.theme);
		// load web settings
		this.webSettings.initializeWebApp();
	}
}
