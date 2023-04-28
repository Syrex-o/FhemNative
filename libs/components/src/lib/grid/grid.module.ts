import { NgModule } from '@angular/core';

import { CoreModule } from '@fhem-native/modules';

import { GridComponent } from './grid.component'; 
import { ContextMenuModule } from '../context-menu/context-menu.module';

import { ContextMenuService } from '@fhem-native/services';

@NgModule({
    imports: [ 
        CoreModule,
        ContextMenuModule
    ],
    declarations: [ GridComponent ],
	exports: [ GridComponent ],
    providers: [ ContextMenuService ]
})
export class GridModule {}