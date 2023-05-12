import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SettingsService, StorageService, ThemeService } from '@fhem-native/services';

import { ThemeName } from '@fhem-native/types/common';

@Component({
    standalone: true,
	selector: 'fhem-native-doc-header',
	templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [ IonicModule ]
})
export class DocHeaderComponent{
    constructor(
        private theme: ThemeService,
        private storage: StorageService,
        public settings: SettingsService){
    }

    changeTheme(): void{
        const changeTo: ThemeName = this.settings.app.theme === 'dark' ? 'bright' : 'dark';
        this.storage.changeSetting({name: 'theme', change: changeTo}).then((res: any)=>{ this.settings.app.theme = res; });
        this.theme.changeTheme(changeTo);
    }
}