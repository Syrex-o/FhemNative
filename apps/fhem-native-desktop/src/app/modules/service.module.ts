import { NgModule } from '@angular/core';

// core services
import { CoreServicesModule } from '@fhem-native/modules';

// env provider
import { APP_CONFIG } from '@fhem-native/app-config';
import { environment } from '../../environments/environment';

@NgModule({
	imports: [ CoreServicesModule ],
	providers: [ {provide: APP_CONFIG, useValue: environment} ]
})
export class ServiceModule {}