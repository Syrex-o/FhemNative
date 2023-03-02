import { NgModule } from '@angular/core';
import { CoreExtendedModule } from '@fhem-native/modules';

import { InputComponent } from './input.component';
import { InfoBtnModule } from '../info-btn/info-btn.module';
import { TextLineModule } from '../text/line/line.module';

@NgModule({
    imports: [
		InfoBtnModule,
		TextLineModule,
		CoreExtendedModule
	],
	declarations: [ InputComponent ],
	exports: [ InputComponent ]
})
export class InputModule {}