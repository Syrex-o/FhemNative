import { NgModule } from '@angular/core';

import { CoreModule } from '@fhem-native/modules';

import { GridComponent } from './grid.component'; 
import { ContextMenuModule } from '../context-menu/context-menu.module';

import { ResizeManagerModule } from '@fhem-native/directives';
import { ContextMenuService } from '@fhem-native/services';

@NgModule({
    imports: [ 
        CoreModule,
        ContextMenuModule,
        ResizeManagerModule
    ],
    declarations: [ GridComponent ],
	exports: [ GridComponent ],
    providers: [ ContextMenuService ]
})
export class GridModule {}