import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Ionic
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// Http Requests
import { HttpClientModule, HttpClient } from '@angular/common/http';

// Toastr
import { ToastrModule } from 'ngx-toastr';
// Hotkeys
import { HotkeyModule } from 'angular2-hotkeys';

// FhemNative Core
import { RoutingModule } from '@FhemNative/router';
import { SideMenuModule } from '@FhemNative/side-menu/side-menu.component';
import { FhemMenuModule } from '@FhemNative/components/fhem-menu/fhem-menu.component';

// Core Services
import { TimeService } from '@FhemNative/services/time.service';
import { TaskService } from '@FhemNative/services/task.service';
import { FhemService } from '@FhemNative/services/fhem.service';
import { ToastService } from '@FhemNative/services/toast.service';
import { HotKeyService } from '@FhemNative/services/hotkey.service';
import { LoggerModule } from '@FhemNative/services/logger/logger.module';
import { ThemeService } from '@FhemNative/services/theme/theme.service';
import { StorageService } from '@FhemNative/services/storage.service';
import { VariableService } from '@FhemNative/services/variable.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { UndoRedoService } from '@FhemNative/services/undo-redo.service';
import { StructureService } from '@FhemNative/services/structure.service';
import { BackButtonService } from '@FhemNative/services/back-button.service';
import { EventHandlerService } from '@FhemNative/services/event-handler.service';
import { SelectComponentService } from '@FhemNative/services/select-component.service';
import { ComponentLoaderService } from '@FhemNative/services/component-loader.service';
import { NativeFunctionsService } from '@FhemNative/services/native-functions.service';

// App Services
import { ElectronService } from './services/electron.service';
import { SettingsChildService } from './services/settings.service';

// Router
import { RouteReuseStrategy } from '@angular/router';

// Basic
import { AppComponent } from './app.component';

// Translate
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { 
	TranslateModule, TranslateLoader, TranslateService,
	MissingTranslationHandler, MissingTranslationHandlerParams
} from '@ngx-translate/core';

// json loader
export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
// missing loader --> translate: {default: some val}
export class DefaultMissingTransLationHandler  implements MissingTranslationHandler {
	handle(params: MissingTranslationHandlerParams) {
		if (params.interpolateParams) {
			return (params.interpolateParams as any)["default"] || params.key;
		}
		return params.key;
	}
}

@NgModule({
	declarations: [ AppComponent ],
	imports: [
		// FhemNative Core
		LoggerModule,
		FhemMenuModule,
		SideMenuModule,
		IonicStorageModule.forRoot(),

		// Translate
		HttpClientModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			},
			missingTranslationHandler: {
				provide: MissingTranslationHandler,
				useClass: DefaultMissingTransLationHandler
			}
		}),
		// FhemNative Core router
		RoutingModule,
		// Others
		BrowserModule,
		FontAwesomeModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot(),
		HotkeyModule.forRoot(),
		IonicModule.forRoot({'mode': 'md'}),
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		// FhemNative Core
		FhemService,
		TimeService,
		TaskService,
		ToastService,
		ThemeService,
		HotKeyService,
		StorageService,
		VariableService,
		SettingsService,
		UndoRedoService,
		StructureService,
		BackButtonService,
		EventHandlerService,
		SelectComponentService,
		ComponentLoaderService,
		NativeFunctionsService,
		// App
		ElectronService,
		SettingsChildService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
