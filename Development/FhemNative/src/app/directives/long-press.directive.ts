import { Directive, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
	selector: '[long-press]'
})
export class LongPressDirective {
	@Input() duration = 500;
	private pressing: boolean;
	private longPressing: boolean;
	private timeout: any;

	private startMouse: any = {};
	private currentMouse: any = {};

	@Output() onLongPress = new EventEmitter();

	@HostBinding('class.press') get press() { return this.pressing; }

	@HostBinding('class.longpress') get longPress() { return this.longPressing; }

	@HostListener('touchstart', ['$event'])
	@HostListener('mousedown', ['$event'])
	onMouseDown(e) {
		this.startMouse = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.pressing = true;
		this.longPressing = false;
		this.timeout = setTimeout(() => {
			// checking the location distance from start to current
			if (Math.abs(this.startMouse.x - this.currentMouse.x) < 50 && Math.abs(this.startMouse.y - this.currentMouse.y) < 50) {
				this.longPressing = true;
				this.onLongPress.emit(e);
			}
		}, this.duration);
	}

	@HostListener('mousemove', ['$event'])
	@HostListener('touchmove', ['$event'])
	onMouseMove(e) {
		if (this.pressing) {
			this.currentMouse = {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
			};
		}
	}

	@HostListener('touchend')
	@HostListener('mouseup')
	endPress() {
		clearTimeout(this.timeout);
		this.longPressing = false;
		this.pressing = false;
	}
}
