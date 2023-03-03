import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { SettingsPageComponent } from './settings.page';

import { ScrollHeaderModule } from '@fhem-native/directives';

import { CloseBtnContainerModule, SelectModule, SwitchModule, TextBlockModule, UI_BoxComponent, UI_CategoryComponent } from '@fhem-native/components';
import { ImportExportService } from '@fhem-native/services';

import { SettingsPageRoutingModule } from './settings-routing.module';

@NgModule({
	imports: [
		FormsModule,
		IonicModule,
		RouterModule,
		CommonModule,
		TranslateModule,
		SettingsPageRoutingModule,
		// Directives
		ScrollHeaderModule,
		// Components
		SelectModule,
		SwitchModule,
		CloseBtnContainerModule,
		// UI components
		TextBlockModule,
		UI_BoxComponent,
		UI_CategoryComponent
	],
	providers: [ ImportExportService ],
	declarations: [ SettingsPageComponent ],
	exports: [ 
		IonicModule,
		TranslateModule,
		ScrollHeaderModule,
		CloseBtnContainerModule,
		SettingsPageComponent
	]
})
export class SettingsPageModule {}