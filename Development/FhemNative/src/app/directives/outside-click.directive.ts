import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';


@Directive({ selector: '[outside-click]' })
export class OutsideClickDirective {
	@Output() onOutsideClick = new EventEmitter();

	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target']) 
	onClick(target) {
    	if (!this.ref.nativeElement.contains(target)) {
      		this.onOutsideClick.emit(target);
    	}
  	}

  	constructor(private ref: ElementRef){}
}