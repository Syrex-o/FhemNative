import { Component } from '@angular/core';
import { Route } from '@angular/router';

import { SettingsPageModule } from '@fhem-native/pages';

@Component({
	standalone: true,
	selector: 'fhem-native-desktop-settings',
	templateUrl: 'settings.page.html',
    styleUrls: ['./settings.page.scss'],
    imports: [ SettingsPageModule ]
})
export class DesktopSettingsPageComponent{
    
}

export const DESKTOP_SETTINGS_ROUTES: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                component: DesktopSettingsPageComponent,
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