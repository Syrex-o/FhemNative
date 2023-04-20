import { NgModule } from '@angular/core';

import { DocItemComponent } from './doc-item.component';

import { DocItemHeaderComponent } from './doc-header/doc-header.component';

@NgModule({
	imports: [
		DocItemComponent,

        DocItemHeaderComponent
	],
	exports: [
		DocItemComponent,

        DocItemHeaderComponent
	]
})
export class DocItemModule {}