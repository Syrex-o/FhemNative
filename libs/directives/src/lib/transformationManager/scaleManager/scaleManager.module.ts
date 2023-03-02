import { NgModule } from '@angular/core';

import { ScaleManagerDirective } from './scaleManager.directive'; 

@NgModule({
  declarations: [ ScaleManagerDirective ],
  exports: [ ScaleManagerDirective ]
})
export class ScaleManagerModule {}