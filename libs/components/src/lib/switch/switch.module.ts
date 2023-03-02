import { NgModule } from '@angular/core';
import { CoreExtendedModule } from '@fhem-native/modules';

import { SwitchComponent } from './switch.component';
import { InfoBtnModule } from '../info-btn/info-btn.module';
import { TextBlockModule } from '../text/block/block.module'; 
import { UI_BoxComponent } from '../_ui';

@NgModule({
    imports: [
		InfoBtnModule,
		TextBlockModule,
		CoreExtendedModule,
		
		UI_BoxComponent
	],
	declarations: [ SwitchComponent ],
	exports: [ SwitchComponent ]
})
export class SwitchModule {}