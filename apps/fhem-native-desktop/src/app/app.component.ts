import { Component, NgZone, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

// Services
import { FhemService, ThemeService, LoaderService, StorageService, SettingsService } from '@fhem-native/services';

// Plugins
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
	selector: 'fhem-native-root',
	templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit{
	constructor(
		private zone: NgZone,
		private fhem: FhemService,
		private platform: Platform,
		private theme: ThemeService,
		public loader: LoaderService,
		private storage: StorageService,
		public settings: SettingsService) {
		// initialize app
		this.initializeApp();
	}

	ngOnInit(): void {
		// app pause and resume
		this.platform.resume.subscribe(()=> this.zone.run(()=> this.handleAppResume() ));
		this.platform.pause.subscribe(()=> this.zone.run(()=> this.handleAppPause() ));
	}

	private async initializeApp(): Promise<void>{
		// initialize storage
		await this.storage.initStorage();
		// Load App Defaults
		await this.settings.loadDefaults();
		// adjust theme
		this.theme.changeTheme(this.settings.app.theme);
		// hide splash
		this.platform.ready().then(()=>{
			if(Capacitor.isPluginAvailable('StatusBar')) StatusBar.setBackgroundColor({color: this.theme.getThemeColor('--primary-app')});
			SplashScreen.hide({ fadeOutDuration: 250 });
		});
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
