import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentLoaderComponent } from './comp-loader.component';

import { GridModule } from '../grid/grid.module';
import { ResizeManagerModule, TransformationManagerModule } from '@fhem-native/directives';

@NgModule({
	imports: [ 
		CommonModule,
		GridModule,
		ResizeManagerModule,
		TransformationManagerModule
	],
	declarations: [ ComponentLoaderComponent ],
	exports: [ ComponentLoaderComponent ]
})
export class ComponentLoaderModule {}