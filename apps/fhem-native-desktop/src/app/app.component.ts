import { Component, NgZone, OnInit } from '@angular/core';

// Services
import { FhemService, ThemeService, LoaderService, StorageService, SettingsService } from '@fhem-native/services';

// Plugins
import { App } from '@capacitor/app';

@Component({
	selector: 'fhem-native-desktop-root',
	templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit{
	constructor(
		private zone: NgZone,
		private fhem: FhemService,
		private theme: ThemeService,
		public loader: LoaderService,
		private storage: StorageService,
		public settings: SettingsService) {
		// initialize app
		this.initializeApp();
	}

	ngOnInit(): void {
		// app pause and resume
		App.addListener('pause', ()=> this.zone.run(()=> this.handleAppPause()) );
		App.addListener('resume', ()=> this.zone.run(()=> this.handleAppResume()) );
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

	// App events
	private handleAppResume(): void{
		this.fhem.reconnect();
	}

	private handleAppPause(): void{
		this.fhem.disconnect();
	}
}
