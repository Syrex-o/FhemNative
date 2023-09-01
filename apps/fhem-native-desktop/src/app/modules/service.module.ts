import { ErrorHandler, NgModule } from '@angular/core';

// core services bundled in module
import { CoreServicesModule } from '@fhem-native/modules';

// additional services and platform replacements
import { ErrorHandlerService, ImportExportService, ImportExportServiceDesktop } from '@fhem-native/services';

// env provider
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../../environments/environment';

@NgModule({
	imports: [ CoreServicesModule ],
	providers: [ 
		{provide: APP_CONFIG, useValue: environment},
		{ provide: ErrorHandler, useClass: ErrorHandlerService },

		// platform specific services
		{ provide: ImportExportService, useClass: ImportExportServiceDesktop }
	]
})
export class ServiceModule {}