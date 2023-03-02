import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SelectModule } from '../select.module';
import { IconModule } from '../../icon/icon.module';

import { SelectIconComponent } from './select-icon.component';
import { TextLineModule } from '../../text/line/line.module';

@NgModule({
    imports: [
		IconModule,
		FormsModule, 
		CommonModule,
		SelectModule,
		TextLineModule
	],
	declarations: [ SelectIconComponent ],
	exports: [ SelectIconComponent ]
})
export class SelectIconModule {}