import { NgModule } from '@angular/core';
import { CoreExtendedModule } from '@fhem-native/modules';

import { SelectComponent } from './select.component';

import { TextLineModule } from '../text/line/line.module'; 
import { InfoBtnModule } from '../info-btn/info-btn.module';
import { StateIconModule } from '../state-icon/state-icon.module';

@NgModule({
    imports: [
		InfoBtnModule,
		TextLineModule,
		StateIconModule,
		CoreExtendedModule
	],
	declarations: [ SelectComponent ],
	exports: [ SelectComponent ]
})
export class SelectModule {}