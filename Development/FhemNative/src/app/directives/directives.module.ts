import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { Resize } from './resize.directive';
import { ClickerDirective } from './clicker.directive';
import { NgIfOnceDirective } from './ngIfOnce.directive';

@NgModule({
		declarations: [
			Resize,
			ClickerDirective,
			NgIfOnceDirective
		],
		imports: [
			CommonModule
		],
		exports: [
			Resize,
			ClickerDirective,
			NgIfOnceDirective
		]
})
export class DirectivesModule { }
