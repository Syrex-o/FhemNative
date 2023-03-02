import { NgModule } from '@angular/core';
import { CoreAndTranslateModule } from '@fhem-native/modules';

import { ContextMenuComponent } from './context-menu.component';

import { IconModule } from '../icon/icon.module';
import { PopoverModule } from '../popover/popover.module';

import { ImportExportService } from '@fhem-native/services';

@NgModule({
	imports: [
		IconModule,
		PopoverModule,
		CoreAndTranslateModule
	],
	declarations: [ ContextMenuComponent ],
	providers: [ ImportExportService ],
	exports: [ ContextMenuComponent ]
})
export class ContextMenuModule {}