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
        children: [
            {
                path: '',
                component: MobileSettingsPageComponent,
            },
            {
                path: 'login',
                loadChildren: () => import('@fhem-native/pages').then( m => m.LOGIN_ROUTES)
            },
            {
                path: 'advanced',
                loadChildren: () => import('@fhem-native/pages').then( m => m.ADVANCED_ROUTES)
            },
            {
                path: 'support',
                loadChildren: () => import('@fhem-native/pages').then( m => m.SUPPORT_ROUTES)
            }
        ]
    }
];