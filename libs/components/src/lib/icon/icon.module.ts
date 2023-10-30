import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { CoreModule } from '@fhem-native/modules';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';

import { IconComponent } from './icon.component';

@NgModule({
	imports: [ 
		CoreModule,
		MatIconModule,
		HttpClientModule,
		FontAwesomeModule
	],
    declarations: [ IconComponent ],
	exports: [ IconComponent ]
})
export class IconModule {
	constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer){
		matIconRegistry.addSvgIconSet( domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg') );
	}
}