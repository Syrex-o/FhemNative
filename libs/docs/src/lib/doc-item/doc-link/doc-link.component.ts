import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { DocItemTextComponent } from '../doc-text/doc-text.component';

interface LinkContent {
    type: 'itnernal'|'external',
    text: string,
    linkText: string,
    link: string
}

@Component({
    standalone: true,
	selector: 'fhem-native-doc-item-link',
	template: `
        <ng-container *ngIf="linkContent.type === 'external'; else INTERNAL">
            <fhem-native-doc-item-text [text]="linkContent.text">
                <a class="link-external bold" [href]="linkContent.link" target="_blank">{{linkContent.linkText}}</a>
            </fhem-native-doc-item-text>
        </ng-container>

        <ng-template #INTERNAL>
            <p>dummy --> implement this</p>
        </ng-template>
    `,
    imports: [
        CommonModule,
        DocItemTextComponent
    ]
})
export class DocItemLinkComponent{
    @Input() linkContent!: LinkContent;
}