import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BackButtonService, ImportExportService, LoggerService, SettingsService, StorageService, StructureService, ThemeService, ToastService } from '@fhem-native/services';

import { getRawVersionCode, getUID } from '@fhem-native/utils';
import { APP_CONFIG, LangOptions, ThemeOptions } from '@fhem-native/app-config';

// Plugins
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

import { Room } from '@fhem-native/types/room';

@Component({
	selector: 'fhem-native-settings',
	templateUrl: 'settings.page.html',
	styleUrls: ['../pages.style.scss', 'settings.page.scss']
})
export class SettingsPageComponent implements OnInit, OnDestroy{
	private readonly handleID = getUID();

	langOptions = LangOptions;
	themeOptions = ThemeOptions;
	currentVersion = getRawVersionCode(this.appConfig.versionCode);
	primaryColor$ = this.theme.getThemePipe('--primary');

	constructor(
		private toast: ToastService,
		private theme: ThemeService,
		private logger: LoggerService,
		private storage: StorageService,
		public settings: SettingsService,
		private backBtn: BackButtonService,
		private structure: StructureService,
		private translate: TranslateService,
		@Inject(APP_CONFIG) private appConfig: any,
		private importExport: ImportExportService){
	}

	ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.back() );
	}

	changeAppSetting(setting: string, value: any): void{
		this.storage.changeSetting({name: setting, change: value}).then((res: any)=>{ this.settings.app[setting] = res; });
	}

	changeLang(lang: string): void{
		this.changeAppSetting('language', lang);
		this.translate.use(lang);
	}

	changeTheme(theme: string): void{
		this.changeAppSetting('theme', theme);
		this.theme.changeTheme(theme);
		// update status bar color
		if(Capacitor.isPluginAvailable('StatusBar')) StatusBar.setBackgroundColor({color: this.theme.getThemeColor('--primary-app')});
	}

	async downloadConfig(){
		const rooms: Room[] = await this.storage.getSetting('rooms');
		this.importExport.exportRooms(rooms);
	}

	async importConfig(){
		const rooms = await this.importExport.importRooms();
		if(!rooms) return;

		this.structure.rooms = rooms;
		await this.structure.saveRooms();
		this.structure.changeRoom(this.structure.rooms[0])
	}

	downloadLog(){ this.logger.exportLogs(); }
	openExternal(link: string){ window.open(link, '_blank'); }

	showTrademarks(){
		this.toast.showAlert(
			'Hinweis zur Markennutzung',
			(
				'FHEM ist eine unter der Registernummer 302015211004 beim Deutschen Marken- und Patentamt eingetragene Marke von Rudolf König, Neuwiesenstraße 10, 60528 Frankfurt am Main. '
				+ 'Das Logo (Abbildung) ist eine unter der Nummer ... beim Deutschen Markenund Patentamt eingetragene Marke des Vereins FHEM e.V. Die Darstellung der Marken wurde vom Anbieter (Lizenznehmer) lizenziert. '
				+ 'Die Markeninhaber stehen mit dem Lizenznehmer in keiner Verbindung. '
				+ 'Die Darstellung der Marken stellt weder eine ausdrückliche noch stillschweigende Empfehlung der Markeninhaber zum Angebot dar, mit dem die Darstellung der Marken in Zusammenhang steht. '
				+ 'Die Software FHEM ist freie Software unter der GNU Public License v2 (https://www.gnu.de/documents/gpl-2.0.de.html) und kann unentgeltlich auf der Webseite https://fhem.de bezogen werden.'
			),
			false
		)
	}

	async back(){
		if(!this.structure.currentRoom) await this.structure.loadRooms();
		this.structure.changeRoom( this.structure.currentRoom || this.structure.rooms[0], true );
	}

	ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}