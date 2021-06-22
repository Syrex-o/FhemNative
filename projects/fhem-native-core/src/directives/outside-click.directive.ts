import { Directive, NgModule, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({ selector: '[outside-click]' })
export class OutsideClickDirective {
	@Output() onOutsideClick = new EventEmitter();

	constructor(private ref: ElementRef){}

	@HostListener('document:click', ['$event.target'])
	onClick(target: HTMLElement) {
		if (!this.ref.nativeElement.contains(target)) {
			this.onOutsideClick.emit(target);
		}
	}
}
@NgModule({
	declarations: [ OutsideClickDirective ],
	exports: [ OutsideClickDirective ]
})
export class OutsideClickModule {}