import { NgModule } from '@angular/core';

import { TransformationManagerDirective } from './transformationManager.directive'; 

@NgModule({
  declarations: [ TransformationManagerDirective ],
  exports: [ TransformationManagerDirective ]
})
export class TransformationManagerModule {}