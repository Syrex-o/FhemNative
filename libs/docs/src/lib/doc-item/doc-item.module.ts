import { NgModule } from '@angular/core';

import { DocItemComponent } from './doc-item.component';

import { DocItemTextComponent } from './doc-text/doc-text.component';
import { DocItemHeaderComponent } from './doc-header/doc-header.component';

@NgModule({
	imports: [
		DocItemComponent,

		DocItemTextComponent,
        DocItemHeaderComponent
	],
	exports: [
		DocItemComponent,

		DocItemTextComponent,
        DocItemHeaderComponent
	]
})
export class DocItemModule {}