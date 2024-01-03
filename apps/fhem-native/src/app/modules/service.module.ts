import { ErrorHandler, NgModule } from '@angular/core';

// core services bundled in module
import { CoreServicesModule } from '@fhem-native/modules';

// additional services and platform replacements
import { ErrorHandlerService, ImportExportService, ImportExportServiceMobile, StoreService } from '@fhem-native/services';


// env provider
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../../environments/environment';

@NgModule({
	imports: [ CoreServicesModule ],
	providers: [
		StoreService,
		{ provide: APP_CONFIG, useValue: environment },
		{ provide: ErrorHandler, useClass: ErrorHandlerService },
		
		// platform specific services
		{ provide: ImportExportService, useClass: ImportExportServiceMobile }
	]
})
export class ServiceModule {}