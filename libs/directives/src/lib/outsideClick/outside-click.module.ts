import { NgModule } from '@angular/core';
import { OutsideClickDirective } from './outside-click.directive';

@NgModule({
	declarations: [ OutsideClickDirective ],
	exports: [ OutsideClickDirective ]
})
export class OutsideClickModule {}