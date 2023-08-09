import { NgModule } from '@angular/core';
import { ContextClickDirective } from './context-click.directive';

@NgModule({
  declarations: [ ContextClickDirective ],
  exports: [ ContextClickDirective ]
})
export class ContextClickModule {}