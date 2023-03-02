import { NgModule } from '@angular/core';
import { ResizeManagerDirective } from './resizeManager.directive'; 

@NgModule({
  declarations: [ ResizeManagerDirective ],
  exports: [ ResizeManagerDirective ]
})
export class ResizeManagerModule {}