import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { Resize } from './resize.directive';
import { ClickerDirective } from './clicker.directive';

@NgModule({
		declarations: [
			Resize,
			ClickerDirective
		],
		imports: [
			CommonModule
		],
		exports: [
			Resize,
			ClickerDirective
		]
})
export class DirectivesModule { }
