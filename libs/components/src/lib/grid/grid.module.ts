import { NgModule } from '@angular/core';

import { CoreModule } from '@fhem-native/modules';

import { GridComponent } from './grid.component'; 
import { ContextMenuModule } from '../context-menu/context-menu.module';

import { ContextClickModule } from '@fhem-native/directives';

@NgModule({
    imports: [ 
        CoreModule,
        ContextMenuModule,
        ContextClickModule
    ],
    declarations: [ GridComponent ],
	exports: [ GridComponent ]
})
export class GridModule {}