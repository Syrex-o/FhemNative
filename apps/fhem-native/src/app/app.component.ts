import { Component, NgZone, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

// Services
import { FhemService, ThemeService, LoaderService, StorageService, SettingsService, StructureService } from '@fhem-native/services';

// Plugins
import { App } from '@capacitor/app';
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
		public settings: SettingsService,
		private structure: StructureService) {
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
		// load rooms
		await this.structure.loadRooms();
		// adjust theme
		this.theme.changeTheme(this.settings.app.theme);
		// hide splash
		this.platform.ready().then(()=>{
			if(Capacitor.isPluginAvailable('StatusBar')) setTimeout(()=> StatusBar.setBackgroundColor({color: this.theme.getThemeColor('--secondary')}), 100);
			SplashScreen.hide({ fadeOutDuration: 250 });
		});
		// initialize fhem
		this.fhem.connect();
	}

	// App events
	private handleAppPause(): void{
		this.fhem.disconnect();
	}
	private handleAppResume(): void{
		this.fhem.reconnect();
	}
}
