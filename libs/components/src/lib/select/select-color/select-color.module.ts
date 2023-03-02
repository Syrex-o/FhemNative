import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SelectModule } from '../select.module';
import { TextLineModule } from '../../text/line/line.module';
import { SelectColorComponent } from './select-color.component';

@NgModule({
    imports: [ 
		FormsModule, 
		CommonModule,
		SelectModule,
		TextLineModule
	],
	declarations: [ SelectColorComponent ],
	exports: [ SelectColorComponent ]
})
export class SelectColorModule {}