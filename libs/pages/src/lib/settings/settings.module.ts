import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { SettingsPageComponent } from './settings.page';

import { RightsTermsComponent, RightsUsageComponent } from '../rights';

import { ScrollHeaderModule } from '@fhem-native/directives';

import { CloseBtnContainerModule, PickerComponent, SelectModule, SwitchModule, TextBlockModule, UI_BoxComponent, UI_CategoryComponent } from '@fhem-native/components';

@NgModule({
	imports: [
		FormsModule,
		IonicModule,
		RouterModule,
		CommonModule,
		TranslateModule,
		// Directives
		ScrollHeaderModule,
		// Components
		SelectModule,
		SwitchModule,
		PickerComponent,
		CloseBtnContainerModule,
		// UI components
		TextBlockModule,
		UI_BoxComponent,
		UI_CategoryComponent,
		// Rights
		RightsTermsComponent,
		RightsUsageComponent
	],
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