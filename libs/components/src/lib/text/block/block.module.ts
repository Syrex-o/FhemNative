import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextLineModule } from '../line/line.module';
import { TextBlockComponent } from './block.component';
import { TextLineComponent } from '../line/line.component';

@NgModule({
    imports: [ TextLineModule, CommonModule ],
	declarations: [ TextBlockComponent ],
	exports: [ TextBlockComponent, TextLineComponent ]
})
export class TextBlockModule {}