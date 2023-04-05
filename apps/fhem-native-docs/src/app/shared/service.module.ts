import { ErrorHandler, NgModule } from '@angular/core';

// Modules
import { ToastrModule } from 'ngx-toastr';
import { IonicModule } from '@ionic/angular';
import { HotkeyModule } from 'angular2-hotkeys';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Docs Services
import { WebsettingsService } from './services/webSettings.service';

// Core Services
import {
	ToastService,
    ThemeService,
    StorageService,
	SettingsService,
	ErrorHandlerService
} from '@fhem-native/services';

// env provider
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../../environments/environment';

@NgModule({
	imports: [
		// Modules
		FontAwesomeModule,
		ToastrModule.forRoot(),
		HotkeyModule.forRoot(),
		IonicStorageModule.forRoot(),
		IonicModule.forRoot({mode: 'md'}),
	],
	providers: [
		{ provide: APP_CONFIG, useValue: environment },
		{ provide: ErrorHandler, useClass: ErrorHandlerService },
		// Web Services
		// SeoService,
		WebsettingsService,
		// Core Services
		ToastService,
        ThemeService,
        StorageService,
		SettingsService
	]
})
export class ServiceModule {}