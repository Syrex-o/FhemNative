import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BackButtonService, ImportExportService, LoggerService, SettingsService, StorageService, StructureService, ThemeService } from '@fhem-native/services';

import { getUID } from '@fhem-native/utils';
import { APP_CONFIG, DesktopSettings, LangOptions, MobileSettings, ThemeOptions } from '@fhem-native/app-config';

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
	currentVersion = this.importExport.getRawVersionCode();
	platformSettings = this.appConfig.platform === 'desktop' ? DesktopSettings : MobileSettings;

	primaryColor$ = this.theme.getThemePipe('--primary');

	constructor(
		private theme: ThemeService,
		private logger: LoggerService,
		private storage: StorageService,
		public settings: SettingsService,
		private backBtn: BackButtonService,
		private structure: StructureService,
		private translate: TranslateService,
		private importExport: ImportExportService,
		@Inject(APP_CONFIG) private appConfig: any){
	}

	ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.back() );
	}

	private changeAppSetting(setting: string, value: any): void{
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

	back(): void{
		this.structure.changeRoom( this.structure.currentRoom || this.structure.rooms[0], true );
	}

	ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}