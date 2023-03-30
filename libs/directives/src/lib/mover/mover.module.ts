import { NgModule } from '@angular/core';
import { MoverDirective } from './mover.directive'; 

@NgModule({
	declarations: [ MoverDirective ],
	exports: [ MoverDirective ]
})
export class MoverModule {}