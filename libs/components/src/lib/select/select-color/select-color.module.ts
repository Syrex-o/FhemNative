import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SelectModule } from '../select.module';
import { SelectColorComponent } from './select-color.component';
import { TextBlockModule } from '../../text/block/block.module';

@NgModule({
    imports: [ 
		FormsModule, 
		CommonModule,
		SelectModule,
		TranslateModule,
		TextBlockModule
	],
	declarations: [ SelectColorComponent ],
	exports: [ SelectColorComponent ]
})
export class SelectColorModule {}