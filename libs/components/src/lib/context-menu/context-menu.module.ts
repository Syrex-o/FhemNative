import { NgModule } from '@angular/core';
import { CoreAndTranslateModule } from '@fhem-native/modules';

import { ContextMenuComponent } from './context-menu.component';

import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';

@NgModule({
	imports: [
		IconModule,
		PopoverModule,
		CoreAndTranslateModule
	],
	declarations: [ ContextMenuComponent ],
	exports: [ ContextMenuComponent ]
})
export class ContextMenuModule {}