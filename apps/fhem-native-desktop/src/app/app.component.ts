import { Component } from '@angular/core';

// Services
import { FhemService, ThemeService, LoaderService, StorageService, SettingsService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-desktop-root',
	templateUrl: 'app.component.html'
})
export class AppComponent{
	constructor(
		private fhem: FhemService,
		private theme: ThemeService,
		public loader: LoaderService,
		private storage: StorageService,
		public settings: SettingsService) {
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
		// initialize fhem
		this.fhem.connect();
	}
}
