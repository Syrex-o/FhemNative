import { ErrorHandler, NgModule } from '@angular/core';

// core services
import { CoreServicesModule } from '@fhem-native/modules';

// error handler
import { ErrorHandlerService } from '@fhem-native/services';

// env provider
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../../environments/environment';

@NgModule({
	imports: [ CoreServicesModule ],
	providers: [ 
		{ provide: APP_CONFIG, useValue: environment },
		{ provide: ErrorHandler, useClass: ErrorHandlerService }
	]
})
export class ServiceModule {}