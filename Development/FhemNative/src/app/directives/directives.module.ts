import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { LongPressDirective } from './long-press.directive';
import { Resize } from './resize.directive';
import { DoubleClick } from './double-click.directive';

@NgModule({
		declarations: [
			LongPressDirective,
			Resize,
			DoubleClick
		],
		imports: [
			CommonModule
		],
		exports: [
			LongPressDirective,
			Resize,
			DoubleClick
		]
})
export class DirectivesModule { }
