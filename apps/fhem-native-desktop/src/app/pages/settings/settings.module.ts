import { NgModule } from '@angular/core';

import { DesktopSettingsPageComponent } from './settings.page';
import { DesktopSettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPageModule } from '@fhem-native/pages';

@NgModule({
	imports: [
		DesktopSettingsPageRoutingModule,
        // Main Settings
        SettingsPageModule
	],
	declarations: [ DesktopSettingsPageComponent ]
})
export class DesktopSettingsPageModule {}