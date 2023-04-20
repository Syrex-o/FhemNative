import { Component } from '@angular/core';
import { Route } from '@angular/router';

import { SettingsPageModule } from '@fhem-native/pages';

@Component({
	standalone: true,
	selector: 'fhem-native-desktop-settings',
	templateUrl: 'settings.page.html',
    imports: [
		SettingsPageModule
	]
})
export class DesktopSettingsPageComponent{
    
}

export const DESKTOP_SETTINGS_ROUTES: Route[] = [
    {
        path: '',
        component: DesktopSettingsPageComponent
    }
];