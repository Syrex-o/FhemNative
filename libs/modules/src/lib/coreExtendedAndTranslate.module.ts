import { NgModule } from '@angular/core';

import { CoreExtendedModule } from './coreExtended.module'; 

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CoreExtendedModule,
		TranslateModule
	],
	exports: [
		CoreExtendedModule,
		TranslateModule
	]
})
export class CoreExtendedAndTranslateModule {}
