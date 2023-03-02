import { NgModule } from '@angular/core';

import { FhemComponent } from './fhem-component.component';
import { LoaderModule, TextBlockModule } from '@fhem-native/components';

import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';
import { ResizeManagerModule, TransformationItemModule } from '@fhem-native/directives';

import { ContextMenuService } from '@fhem-native/services';

@NgModule({
    imports: [
        CoreExtendedAndTranslateModule,
        // Directives
        ResizeManagerModule,
        TransformationItemModule,
        // Additional
        LoaderModule,
        TextBlockModule
    ],
    declarations: [ FhemComponent ],
    providers: [ ContextMenuService ],
	exports: [ 
        FhemComponent,
        CoreExtendedAndTranslateModule
    ]
})
export class FhemComponentModule {}