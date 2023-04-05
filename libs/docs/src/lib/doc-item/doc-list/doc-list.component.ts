import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { DocItemTextComponent } from '../doc-text/doc-text.component';

@Component({
	standalone: true,
	selector: 'fhem-native-doc-item-list',
	template: `
        <div class="list-block">
            <ul>
                <li *ngFor="let listItem of listContent">
                    <fhem-native-doc-item-text [noMargin]="true">
                        {{listItem}}
                    </fhem-native-doc-item-text>
                </li>
            </ul>
        </div>
    `,
	styleUrls: ['./doc-list.component.scss'],
	imports: [
		CommonModule,
        DocItemTextComponent
	]
})
export class DocItemListComponent{
    @Input() listContent!: string[];
}