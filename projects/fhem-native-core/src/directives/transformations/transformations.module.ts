import { NgModule } from '@angular/core';

// Directives
import { ClickerModule } from '../clicker.directive';

import { MoverDirective } from './mover.directive';
import { RotatorDirective } from './rotator.directive';
import { ResizerDirective } from './resizer.directive';
import { TransformationHandlerDirective } from './transformation-handler.directive';

@NgModule({
	imports: [
		ClickerModule
	],
	declarations: [
		MoverDirective,
		RotatorDirective,
		ResizerDirective,
		TransformationHandlerDirective
	],
	exports: [
		ClickerModule,
		
		MoverDirective,
		RotatorDirective,
		ResizerDirective,
		TransformationHandlerDirective
	]
})
export class TransformationsModule { }