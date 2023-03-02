import { NgModule } from '@angular/core';

import { CoreModule } from './core.module'; 

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CoreModule,
		TranslateModule
	],
	exports: [
		CoreModule,
		TranslateModule
	]
})
export class CoreAndTranslateModule {}
