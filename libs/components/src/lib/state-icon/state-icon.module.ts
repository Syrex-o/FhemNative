import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateIconComponent } from './state-icon.component'; 

@NgModule({
    imports: [ CommonModule ],
	declarations: [ StateIconComponent ],
	exports: [ StateIconComponent ]
})
export class StateIconModule {}