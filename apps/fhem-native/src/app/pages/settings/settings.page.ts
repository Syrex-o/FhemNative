import { Component } from '@angular/core';
import { Route } from '@angular/router';

import { SettingsPageModule } from '@fhem-native/pages';

@Component({
	standalone: true,
	selector: 'fhem-native-mobile-settings',
	templateUrl: 'settings.page.html',
	imports: [
		SettingsPageModule
	]
})
export class MobileSettingsPageComponent{
    
}

export const MOBILE_SETTINGS_ROUTES: Route[] = [
    {
        path: '',
        component: MobileSettingsPageComponent
    }
];