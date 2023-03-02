import { NgModule } from '@angular/core';
import { CoreModule } from '@fhem-native/modules';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IconComponent } from './icon.component';

@NgModule({
	imports: [ CoreModule, FontAwesomeModule ],
    declarations: [ IconComponent ],
	exports: [ IconComponent ]
})
export class IconModule {}