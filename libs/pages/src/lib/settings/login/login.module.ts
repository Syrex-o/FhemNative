import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { LoginPageComponent } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';

import { CloseBtnContainerModule, InputModule, SelectColorModule, SelectModule, StateIconModule, SwitchModule, TextBlockModule } from '@fhem-native/components';
import { ScrollHeaderModule } from '@fhem-native/directives';

@NgModule({
	imports: [
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule,
		LoginPageRoutingModule,
		// Components
		InputModule,
		SelectModule,
		SwitchModule,
		StateIconModule,
		TextBlockModule,
		SelectColorModule,
		CloseBtnContainerModule,
		// Directives
		ScrollHeaderModule
	],
	declarations: [ LoginPageComponent ]
})
export class LoginPageModule {}