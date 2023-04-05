import { Component, Input } from '@angular/core';

interface ImgContent {
    ref: string,
    width: string,
    alt?: string,
    center?: boolean
}

@Component({
    standalone: true,
	selector: 'fhem-native-doc-item-image',
	template: `
        <img class="gif round" 
            [attr.alt]="imageContent.alt || ''" 
            [src]="imageContent.ref" 
            [style.max-width]="imageContent.width"
            [class.center]="imageContent.center">
    `,
	styleUrls: ['./doc-img.component.scss']
})
export class DocItemIamgeComponent{
	@Input() imageContent!: ImgContent;
}