import { NgModule } from '@angular/core';

import { MoveManagerDirective } from './moveManager.directive'; 

@NgModule({
  declarations: [ MoveManagerDirective ],
  exports: [ MoveManagerDirective ]
})
export class MoveManagerModule {}