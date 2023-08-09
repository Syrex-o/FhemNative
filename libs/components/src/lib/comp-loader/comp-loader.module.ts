import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentLoaderComponent } from './comp-loader.component';

import { GridModule } from '../grid/grid.module';

import { ContextMenuService } from '@fhem-native/services';
import { TransformationManagerModule } from '@fhem-native/directives';

@NgModule({
	imports: [
		GridModule,
		CommonModule,
		TransformationManagerModule
	],
	declarations: [ ComponentLoaderComponent ],
	providers: [ ContextMenuService ],
	exports: [ ComponentLoaderComponent ]
})
export class ComponentLoaderModule {}