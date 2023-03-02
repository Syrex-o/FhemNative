import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { HomePageComponent } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

import { LoaderModule } from '@fhem-native/components';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		LoaderModule,
		TranslateModule,
		HomePageRoutingModule
	],
	declarations: [ HomePageComponent ]
})
export class HomePageModule {}