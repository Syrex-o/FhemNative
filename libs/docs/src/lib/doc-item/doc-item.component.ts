import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DocItemCodeRawComponent } from './doc-code-raw/doc-code-raw.component';
import { DocItemCodeComponent } from './doc-code/doc-code.component';
import { DocItemHeaderComponent } from './doc-header/doc-header.component';
import { DocItemIamgeComponent } from './doc-img/doc-img.component';
import { DocItemLinkComponent } from './doc-link/doc-link.component';
import { DocItemListComponent } from './doc-list/doc-list.component';
import { DocItemNoteComponent } from './doc-note/doc-note.component';
import { DocItemTextComponent } from './doc-text/doc-text.component';

@Component({
    standalone: true,
	selector: 'fhem-native-doc-item',
	template: `
        <ng-container *ngFor="let contentItem of content">
            <ng-container *ngFor="let innerContentItem of contentItem | keyvalue">
                <!-- doc items -->
                <ng-container [ngSwitch]="innerContentItem.key">
                    <!-- SECTION_HEADER -->
                    <h2 *ngSwitchCase="'SECTION_HEADER'" class="color-a size-d spacing-a">{{innerContentItem.value.text}}</h2>
                    
                    <!-- INNER_HEADER -->
                    <fhem-native-doc-item-header *ngSwitchCase="'INNER_HEADER'" 
                        [asAnchor]="true"
                        [header]="innerContentItem.value.text"
                        [headerID]="innerContentItem.value.ID">
                    </fhem-native-doc-item-header>

                    <!-- TEXT -->
                    <fhem-native-doc-item-text *ngSwitchCase="'TEXT'" [text]="innerContentItem.value"/>

                    <!-- CODE -->
                    <fhem-native-doc-item-code *ngSwitchCase="'CODE'" [codeContent]="innerContentItem.value"/>

                    <!-- RAW CODE -->
                    <fhem-native-doc-item-code-raw *ngSwitchCase="'CODE_RAW'" [codeContent]="innerContentItem.value"/>
                    
                    <!-- NOTE -->
                    <fhem-native-doc-item-note *ngSwitchCase="'NOTE'" [noteContent]="innerContentItem.value"/>
                    
                    <!-- LINK -->
                    <fhem-native-doc-item-link *ngSwitchCase="'LINK'" [linkContent]="innerContentItem.value"/>

                    <!-- IMAGE -->
                    <fhem-native-doc-item-image *ngSwitchCase="'IMAGE'" [imageContent]="innerContentItem.value"/>

                    <!-- LIST -->
                    <fhem-native-doc-item-list *ngSwitchCase="'LIST'" [listContent]="innerContentItem.value"/>

                    <!-- undefined key -->
                    <p *ngSwitchDefault>No Doc Item for: {{innerContentItem.key}}</p>
                </ng-container>
            </ng-container>
        </ng-container>
    `,
    styles: [
        'h2{ margin-top: 3rem }'
    ],
    imports: [
        CommonModule,
        // doc items
        DocItemCodeComponent,
        DocItemCodeRawComponent,
        DocItemHeaderComponent,
        DocItemIamgeComponent,
        DocItemLinkComponent,
        DocItemListComponent,
        DocItemNoteComponent,
        DocItemTextComponent,
    ]
})
export class DocItemComponent implements OnInit{
    @Input() content!: Array<Record<string, any>>;

    ngOnInit(): void{
        console.log(this.content);
    }
}