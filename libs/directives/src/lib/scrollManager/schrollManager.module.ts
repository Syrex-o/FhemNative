import { NgModule } from '@angular/core';

import { ScrollAchorDirective } from './scrollAnchor.directive';
import { ScrollManagerDirective } from './scrollManager.directive';
import { ScrollSectionDirective } from './scrollSection.directive';

@NgModule({
	declarations: [ ScrollAchorDirective, ScrollManagerDirective, ScrollSectionDirective ],
	exports: [  ScrollAchorDirective, ScrollManagerDirective, ScrollSectionDirective ]
})
export class ScrollManagerModule {}