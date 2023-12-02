import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Route } from '@angular/router';

import { SettingsPageComponent, SettingsPageModule } from '@fhem-native/pages';

import { BackButtonService } from '@fhem-native/services';

import { getUID } from '@fhem-native/utils';

@Component({
	standalone: true,
	selector: 'fhem-native-mobile-settings',
	templateUrl: 'settings.page.html',
    styleUrls: ['./settings.page.scss'],
	imports: [ SettingsPageModule ]
})
export class MobileSettingsPageComponent implements OnInit, OnDestroy{
    @ViewChild('CORE_SETTINGS', {read: SettingsPageComponent, static: false}) coreSettings: SettingsPageComponent|undefined;
    private handleID = getUID();

    constructor(private backBtn: BackButtonService){}

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
	}

    closePage(): void{
        this.coreSettings?.back();
    }

    ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
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