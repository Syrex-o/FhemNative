import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { LoaderModule } from '@fhem-native/components';

// Environment
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../environments/environment';

// Modules
import { ToastrModule } from 'ngx-toastr';
import { HotkeyModule } from 'angular2-hotkeys';
import { RoutingModule } from './modules/routing.module';
import { ServiceModule } from './modules/service.module';
import { TranslatorModule } from './modules/translator.module';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		IonicModule.forRoot({mode: 'md'}),
		IonicStorageModule.forRoot(),
		// Modules
		LoaderModule,
		ServiceModule,
		RoutingModule,
		TranslatorModule,
		ToastrModule.forRoot(),
		HotkeyModule.forRoot()
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
