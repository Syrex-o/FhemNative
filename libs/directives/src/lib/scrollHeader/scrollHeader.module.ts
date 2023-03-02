import {NgModule} from "@angular/core";

import { ScrollHeaderDirective } from "./scrollHeader.directive"; 

@NgModule({
	declarations: [ ScrollHeaderDirective ],
	exports: [ ScrollHeaderDirective ]
})
export class ScrollHeaderModule {}