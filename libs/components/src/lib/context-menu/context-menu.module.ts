import { NgModule } from '@angular/core';
import { CoreAndTranslateModule } from '@fhem-native/modules';

import { ContextMenuComponent } from './context-menu.component';

import { IconModule } from '../icon/icon.module';

@NgModule({
	imports: [
		IconModule,
		CoreAndTranslateModule
	],
	declarations: [ ContextMenuComponent ],
	exports: [ ContextMenuComponent ]
})
export class ContextMenuModule {}