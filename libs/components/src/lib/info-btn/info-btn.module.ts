import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { InfoBtnComponent } from './info-btn.component';
import { TextBlockModule } from '../text/block/block.module';

@NgModule({
	imports: [ IonicModule, TextBlockModule ],
	declarations: [ InfoBtnComponent ],
	exports: [ InfoBtnComponent ]
})
export class InfoBtnModule {}