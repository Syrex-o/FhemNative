import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CoreModule } from './core.module';

@NgModule({
	imports: [
		CoreModule,
		FormsModule
	],
	exports: [
		CoreModule,
		FormsModule,
	]
})
export class CoreExtendedModule {}
