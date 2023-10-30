import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ImportExportService, LoggerService, SettingsService, StorageService, StructureService, ThemeService } from '@fhem-native/services';

import { getRawVersionCode } from '@fhem-native/utils';
import { APP_CONFIG, GridSizeOptions, LangOptions, ThemeOptions } from '@fhem-native/app-config';

// Plugins
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

import { Room } from '@fhem-native/types/room';
import { ThemeName } from '@fhem-native/types/common';

@Component({
	selector: 'fhem-native-settings',
	templateUrl: 'settings.page.html',
	styleUrls: ['../pages.style.scss', 'settings.page.scss']
})
export class SettingsPageComponent{
	langOptions = LangOptions;
	themeOptions = ThemeOptions;
	gridSizeOptions = GridSizeOptions;
	currentVersion = getRawVersionCode(this.appConfig.versionCode);
	primaryColor$ = this.theme.getThemePipe('--primary');

	showTerms = false;
	showTrademarks = false;

	constructor(
		private theme: ThemeService,
		private logger: LoggerService,
		private storage: StorageService,
		public settings: SettingsService,
		private structure: StructureService,
		private translate: TranslateService,
		private importExport: ImportExportService,
		@Inject(APP_CONFIG) public appConfig: any){
	}

	changeAppSetting(setting: string, value: any): void{
		this.storage.changeSetting({name: setting, change: value}).then((res: any)=>{ this.settings.app[setting] = res; });
	}

	changeLang(lang: string): void{
		this.changeAppSetting('language', lang);
		this.translate.use(lang);
	}

	changeGrid(enabled?: boolean): void{
		this.changeAppSetting('grid', JSON.stringify({
			enabled: enabled !== undefined ? enabled : this.settings.app.grid.enabled,
			gridSize: this.settings.app.grid.gridSize
		}));
	}

	changeTheme(theme: ThemeName): void{
		this.changeAppSetting('theme', theme);
		this.theme.changeTheme(theme);
		// update status bar color
		if(Capacitor.isPluginAvailable('StatusBar')) StatusBar.setBackgroundColor({color: this.theme.getThemeColor('--secondary')});
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

	async back(){
		if(!this.structure.currentRoom) await this.structure.loadRooms();
		this.structure.changeRoom( this.structure.currentRoom || this.structure.rooms[0], true );
	}
}