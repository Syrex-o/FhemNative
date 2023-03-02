import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

import { ScrollManagerDirective } from './scrollManager.directive';

@Directive({ selector: '[fhemNativeScrollSection]' })
export class ScrollSectionDirective implements OnInit, OnDestroy{
    @Input('fhemNativeScrollSection') id!: string | number;
    @Input() scrollDelta: string|null = null;

    constructor(public host: ElementRef<HTMLElement>, private manager: ScrollManagerDirective){}

    ngOnInit(): void {
        this.manager.register(this);
    }

    public scroll(): void {
        setTimeout(()=> this.host.nativeElement.scrollIntoView({ behavior: 'smooth' }) );
    }

    ngOnDestroy(): void {
        this.manager.remove(this);
    }
}