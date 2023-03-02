import { Directive, Input, HostListener } from '@angular/core';

import { ScrollManagerDirective } from './scrollManager.directive';

@Directive({ selector: '[fhemNativeScrollAnchor]' })
export class ScrollAchorDirective {
    @Input('fhemNativeScrollAnchor') id!: string | number;
    @Input() createAnchorUrl = false;

    constructor(private manager: ScrollManagerDirective){}

    @HostListener('click') scrollToItem() {
        this.manager.scroll(this.id, this.createAnchorUrl);
    }

    public scroll(): void{
        this.manager.scroll(this.id, this.createAnchorUrl);
    }
}