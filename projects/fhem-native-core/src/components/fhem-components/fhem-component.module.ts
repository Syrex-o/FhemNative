import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Translate
import { TranslateModule } from '@ngx-translate/core';

// Components
import { FhemContainerModule } from '../fhem-component-container/fhem-component-container.component';

// Directives
import { NgIfOnceDirective } from '../../directives/ngIfOnce.directive';

@NgModule({
	declarations: [
		NgIfOnceDirective
	],
	imports: [
		FormsModule,
		CommonModule,
		TranslateModule,
		FhemContainerModule
	],
	exports: [
		FormsModule,
		CommonModule,
		TranslateModule,
		FhemContainerModule,
		// Directives
		NgIfOnceDirective
	]
})
export class FhemComponentModule { }