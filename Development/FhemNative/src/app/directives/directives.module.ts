import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { TrimDirective } from './trim.directive';
import { ClickerDirective } from './clicker.directive';
import { ColorizerDirective } from './colorizer.directive';
import { OutsideClickDirective } from './outside-click.directive';

import { MoverDirective } from './transformations/mover.directive';
import { ResizerDirective } from './transformations/resizer.directive';
import { RotatorDirective } from './transformations/rotator.directive';
import { DynamicResizeDirective } from './transformations/dynamic-resize.directive';
import { TransformationHandlerDirective } from './transformations/transformation-handler.directive';


@NgModule({
		declarations: [
			TrimDirective,
			ClickerDirective,
			ColorizerDirective,
			OutsideClickDirective,

			MoverDirective,
			RotatorDirective,
			ResizerDirective,
			DynamicResizeDirective,
			TransformationHandlerDirective
		],
		imports: [
			CommonModule
		],
		exports: [
			CommonModule,
			TrimDirective,
			ClickerDirective,
			ColorizerDirective,
			OutsideClickDirective,

			MoverDirective,
			RotatorDirective,
			ResizerDirective,
			DynamicResizeDirective,
			TransformationHandlerDirective
		]
})
export class DirectivesModule { }
