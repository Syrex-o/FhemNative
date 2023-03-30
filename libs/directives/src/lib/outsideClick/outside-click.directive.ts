import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({ 
    selector: '[fhemNativeOutsideClick]' 
})
export class OutsideClickDirective {
	@Output() outsideClick = new EventEmitter();

	constructor(private ref: ElementRef){}

	@HostListener('document:click', ['$event.target'])
	onClick(target: HTMLElement) {
		if (!this.ref.nativeElement.contains(target)) this.outsideClick.emit(target);
	}
}