import { Directive, Input, ElementRef, HostBinding, HostListener, EventEmitter, Output } from '@angular/core';

import { CreateComponentService } from '../services/create-component.service';
import { HelperService } from '../services/helper.service';

@Directive({ selector: '[double-click]' })
export class ClickerDirective {
	// for long press
	private startMouse: any = {};
	private currentMouse: any = {};
	@Input() duration = 500;

	private pressing: boolean;
	private longPressing: boolean;
	private timeout: any;

	@HostBinding('class.press') get press() { return this.pressing; }
	@HostBinding('class.longpress') get longPress() { return this.longPressing; }

	// for click events
	private clicker = 0;
	private doubleClicked: boolean;

	@Input() editingEnabled = false;
	// used to identify source
	// default double click comes from component
	// other double click users must define a different source
	@Input() source = 'component';

	// Custom Handler for events
	@Output() onDoubleClick = new EventEmitter();
	@Output() onRightClick = new EventEmitter();
	@Output() onLongClick = new EventEmitter();

	@HostBinding('class.double-click') get doubleClick() { return this.doubleClicked; }

	constructor(
		private createComponent: CreateComponentService,
		private ref: ElementRef,
		private helper: HelperService) {

	}

	// create the menu for editing components
	private createEditMenu(e){
		this.createComponent.createSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer, {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
			source: this.source,
			componentID: this.ref.nativeElement.id,
			container: this.helper.find(this.createComponent.containerComponents, 'ID', this.ref.nativeElement.id).item.container
		});
	}

	// double click event
	@HostListener('click', ['$event'])
  	onDblClick(e) {
  		if (this.editingEnabled && (e.target.className === 'overlay-move' || e.target.className === 'grid')) {
  			this.clicker ++;
  			setTimeout(() => {
		  		if (this.clicker >= 2) {
		  			this.doubleClicked = true;
		  			// double click detected on component
		  			if (this.source === 'component') {
		  				this.createEditMenu(e);
		  			} else {
		  				this.onDoubleClick.emit(e);
		  			}
		  			// removing double click class
		  			setTimeout(() => {
		  				this.doubleClicked = false;
		  			}, 500);
		  		}
		  		this.clicker = 0;
		  	}, 250);
  		}
  	}

  	// right click event
  	@HostListener('contextmenu', ['$event'])
  	onContextClick(e) {
  		if (this.editingEnabled && (e.target.className === 'overlay-move' || e.target.className === 'grid')) {
  			if (this.source === 'component') {
		  		this.createEditMenu(e);
		  	} else {
		  		this.onRightClick.emit(e);
		  	}
  		}
  	}

  	// long press event
  	@HostListener('touchstart', ['$event'])
	@HostListener('mousedown', ['$event'])
	onMouseDown(e) {
		if (this.editingEnabled && (e.target.className === 'overlay-move' || e.target.className === 'grid')) {
			this.startMouse = {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
			};
			this.currentMouse = this.startMouse;
			
			this.pressing = true;
			this.longPressing = false;
			this.timeout = setTimeout(() => {
				// checking the location distance from start to current
				if (Math.abs(this.startMouse.x - this.currentMouse.x) < 20 && Math.abs(this.startMouse.y - this.currentMouse.y) < 20) {
					this.longPressing = true;
					if (this.source === 'component') {
		  				this.createEditMenu(e);
		  			} else {
		  				this.onLongClick.emit(e);
		  			}
				}
			}, this.duration);
		}
	}

	@HostListener('mousemove', ['$event'])
	@HostListener('touchmove', ['$event'])
	onMouseMove(e) {
		if (this.editingEnabled && (e.target.className === 'overlay-move' || e.target.className === 'grid')) {
			if (this.pressing) {
				this.currentMouse = {
					x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
					y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
				};
			}
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
