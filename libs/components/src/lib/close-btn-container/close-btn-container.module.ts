import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CloseBtnModule } from './close-btn/close-btn.module';
import { CloseBtnContainerComponent } from './close-btn-container.component';

@NgModule({
	imports: [ CloseBtnModule, IonicModule ],
	declarations: [ CloseBtnContainerComponent ],
	exports: [ CloseBtnContainerComponent ]
})
export class CloseBtnContainerModule {}