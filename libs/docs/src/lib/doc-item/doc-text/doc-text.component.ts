import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	standalone: true,
	selector: 'fhem-native-doc-item-text',
	template: `
        <ng-container *ngIf="textArray.length; else DEFAULT">
            <p class="color-b size-f" [class.bold]="bold" [class.no-margin]="noMargin">
                <ng-container *ngFor="let textPart of textArray">{{textPart}} </ng-container>
                <ng-content></ng-content>
            </p>
        </ng-container>

        <ng-template #DEFAULT>
            <p class="color-b size-f" [class.bold]="bold" [class.no-margin]="noMargin">
                {{text}}
                <ng-content></ng-content>
            </p>
        </ng-template>
    `,
    styles: [
        'p{line-height: 200%;}'
    ],
    imports: [ CommonModule ]
})
export class DocItemTextComponent implements OnInit{
    @Input() text: string|string[] = '';
	@Input() bold = false;
	@Input() noMargin = false;

    textArray: string[] = [];

    ngOnInit(): void{
        if(Array.isArray(this.text)) this.textArray = this.text;
    }
}