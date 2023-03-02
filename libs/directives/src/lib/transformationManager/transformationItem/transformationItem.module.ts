import { NgModule } from '@angular/core';

import { TransformationItemDirective } from './transformationItem.directive';

import { MoveManagerModule } from '../moveManager/moveManager.module';
import { ScaleManagerModule } from '../scaleManager/scaleManager.module';

@NgModule({
	declarations: [ TransformationItemDirective ],
	exports: [ 
		TransformationItemDirective,
		// Modules
		MoveManagerModule,
		ScaleManagerModule
	]
})
export class TransformationItemModule {}