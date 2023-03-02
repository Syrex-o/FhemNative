import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { PopoverComponent } from './popover.component'; 

@NgModule({
    imports: [ 
		IonicModule
	],
	declarations: [ PopoverComponent ],
	exports: [ PopoverComponent ]
})
export class PopoverModule {}