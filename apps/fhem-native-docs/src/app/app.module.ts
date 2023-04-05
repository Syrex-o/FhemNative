import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RoutingModule } from './app-routing.module';

// Modules
import { ServiceModule } from './shared/service.module';
import { TranslatorModule } from './shared/translator.module';

import { AppComponent } from './app.component';
import { DocHeaderComponent, DocSideMenuComponent } from '@fhem-native/docs';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		RoutingModule,
		// Modules
		ServiceModule,
		TranslatorModule,
		// Components
		DocHeaderComponent,
		DocSideMenuComponent
	],
	providers: [

	],
	bootstrap: [AppComponent],
})
export class AppModule {}
