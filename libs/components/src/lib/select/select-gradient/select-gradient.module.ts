import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SelectModule } from '../select.module';
import { TextLineModule } from '../../text/line/line.module';
import { SelectGradientComponent } from './select-gradient.component';

import { ResizeManagerModule } from '@fhem-native/directives';

@NgModule({
    imports: [ 
		FormsModule, 
		CommonModule,
		SelectModule,
		TextLineModule,
		ResizeManagerModule
	],
	declarations: [ SelectGradientComponent ],
	exports: [ SelectGradientComponent ]
})
export class SelectGradientModule {}