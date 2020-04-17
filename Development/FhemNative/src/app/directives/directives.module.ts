import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { ClickerDirective } from './clicker.directive';
import { ColorizerDirective } from './colorizer.directive';
import { ResizeDirective } from './resize.directive';
import { OutsideClickDirective } from './outside-click.directive';


@NgModule({
		declarations: [
			ClickerDirective,
			ColorizerDirective,
			ResizeDirective,
			OutsideClickDirective
		],
		imports: [
			CommonModule
		],
		exports: [
			CommonModule,
			ClickerDirective,
			ColorizerDirective,
			ResizeDirective,
			OutsideClickDirective
		]
})
export class DirectivesModule { }
