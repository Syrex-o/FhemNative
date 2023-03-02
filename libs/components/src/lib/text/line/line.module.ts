import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextLineComponent } from './line.component';

@NgModule({
    imports: [CommonModule],
	declarations: [ TextLineComponent ],
	exports: [ TextLineComponent ]
})
export class TextLineModule {}