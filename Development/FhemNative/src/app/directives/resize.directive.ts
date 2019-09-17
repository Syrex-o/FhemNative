import { Directive, Input, ElementRef, OnChanges, SimpleChanges, Output, EventEmitter, AfterViewInit, Renderer2, HostListener } from '@angular/core';

import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
import { CreateComponentService } from '../services/create-component.service';

@Directive({ selector: '[resize]' })
export class Resize implements OnChanges, AfterViewInit {
	private hostEl;
	private resizeRect: any;

	@Input() editingEnabled = false;
	@Input() minimumWidth = 100;
	@Input() minimumHeight = 50;

	@Output() resized = new EventEmitter();
	@Output() onResize = new EventEmitter();
	@Output() onMove = new EventEmitter();

	private elem: any = {left: 0, top: 0, width: 0, height: 0};
	private elemContainer;

	private mouse: any = {x: 0, y: 0};
	private scroller = 0;

	private width: any;
	private height: any;
	private top: any;
	private left: any;

	private offset: any = {top: 56, left: 0, right: 0};

	private moved = false;
	private selected: any;

	constructor(
		private ref: ElementRef,
		private settings: SettingsService,
		private structure: StructureService,
		private renderer: Renderer2,
		private createComponent: CreateComponentService) {
		this.hostEl = ref.nativeElement;
	}

	ngAfterViewInit() {
		this.createComponent.containerComponents.find((x) => {
			if (x.ID === this.hostEl.id) {
				if (x.REF._view.viewContainerParent.component.container) {
					// component has single container
					this.elemContainer = x.REF._view.viewContainerParent.component.container;
				} else {
					// component has multiple containers
					const containerID = x.REF.hostView._viewContainerRef.element.nativeElement.parentNode.id;
					const swiperIndex = containerID.match(/\d+/)[0];

					this.elemContainer = x.REF._view.viewContainerParent.component.containers[swiperIndex];
				}
			}
		});
		// detect device and size changes
		setTimeout(() => {
			this.responseToDeviceChange();
		}, 0);
	}

	@HostListener('window:resize')
	windowResizer(): void {
		this.responseToDeviceChange();
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (this.editingEnabled) {
			this.getPos(event);
	    	// getting container offsets
	  const container: any = document.getElementById(this.elemContainer.element.nativeElement.parentNode.id).getBoundingClientRect();
			this.offset.top = container.y;
			this.offset.left = container.x;
			this.offset.right = window.innerWidth - (container.x + container.width);

			const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   window.removeEventListener('mouseup', endMove);
	   window.removeEventListener('touchend', endMove);

	        	// save the item position, if the element was moved
	   if (this.moved) {
					this.structure.saveItemPosition({
						item: this.selected,
						dimensions: {
							width: this.width,
							height: this.height,
							top: this.top,
							left: this.left
						},
					});
					this.resized.emit({width: this.width, height: this.height});
				}
			};
			const whileMove = (e) => {
				if (target.className === 'overlay-move') {
					this.mover(e);
				} else {
					this.resizer(e, target);
				}
	        };
			window.addEventListener('mousemove', whileMove);
	  window.addEventListener('mouseup', endMove);

	  window.addEventListener('touchmove', whileMove);
	  window.addEventListener('touchend', endMove);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.editingEnabled) {
			this.buildResizeRect();
		} else {
			this.removeRect();
		}
	}

	private responseToDeviceChange() {
		// resize component if needed
		if (this.settings.app.responsiveResize) {
			const component = this.structure.selectedElement(this.hostEl.id, this.elemContainer);
			const position = component.position;
			let scaler;
			if (component.createScaler) {
				scaler = component.createScaler;
			} else {
				// backward compatibility for components without createScaler
				scaler = {width: window.innerWidth, height: window.innerHeight};
				component.createScaler = scaler;
				this.structure.saveRooms();
			}
			if (window.innerWidth !== scaler.width || window.innerHeight !== scaler.height) {
				const width = parseInt(position.width);
				const left = parseInt(position.left ? position.left : 0);

				this.width = Math.round(this.roundToGrid(width / scaler.width * window.innerWidth));
				this.left = Math.round(this.roundToGrid(left / scaler.width * window.innerWidth));

  				// check, that components are not smaller that allowed
  		this.width = this.width >= this.minimumWidth ? this.width : this.minimumWidth;

  				// adding transition style: like in popup
  		this.hostEl.style.transition = 'all .3s cubic-bezier(.17,.67,.54,1.3)';

  		this.hostEl.style.width = this.width + 'px';
  		this.hostEl.style.left = this.left + 'px';

  				// removing transition style
  		const timeout = setTimeout(() => {
  					this.hostEl.style.transition = 'all 0ms linear';
  				}, 300);

  				// save options
  		component.createScaler = {width: window.innerWidth, height: window.innerHeight};
				this.structure.saveItemPosition({
					item: component.position,
					dimensions: {
						width: this.width,
						left: this.left
					},
				});
			}
		}
	}

	private buildResizeRect() {
		if (!this.resizeRect) {
			this.resizeRect = this.renderer.createElement('div');
			this.renderer.addClass(this.resizeRect, 'movable');
			this.renderer.appendChild(this.hostEl, this.resizeRect);
			this.renderer.setProperty(this.resizeRect, 'innerHTML',
				'<span class="rect top-left"></span>'
				+ '<span class="rect top-right"></span>'
				+ '<span class="rect bottom-left"></span>'
				+ '<span class="rect bottom-right"></span>'
				+ '<span class="rect center-top"></span>'
				+ '<span class="rect center-left"></span>'
				+ '<span class="rect center-right"></span>'
				+ '<span class="rect center-bottom"></span>'
				+ '<span class="overlay-move"></span>'
			);
		}
	}

	private removeRect() {
		if (this.resizeRect) {
			this.renderer.removeChild(this.hostEl, this.resizeRect);
			this.resizeRect = null;
		}
	}

	private getPos(e) {
		const el = this.hostEl.getBoundingClientRect();
		this.elem.left = el.x;
		this.elem.top = el.y;
		this.elem.height = this.height = el.height;
		this.elem.width = this.width = el.width;
		// mouse Position
		this.mouse.x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		this.mouse.y = e.pageY || (e.touches ? e.touches[0].clientY : 0);
		this.offset = {top: 56, left: 0, right: 0};
		// selected Element
		this.selected = this.structure.selectedElement(this.hostEl.id, this.elemContainer).position;
	}

	private mover(e) {
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.evaluateScroller();
		// left maximal and minimal
		const left = this.roundToGrid((d.x - this.mouse.x + this.elem.left) - this.offset.left);
		this.left = (left >= 0 && left + this.elem.width + this.offset.left <= (window.innerWidth - this.offset.right)) ? left : this.left;
		this.hostEl.style.left = this.left + 'px';

		// top maximal and minimal
		const top = this.roundToGrid(((d.y - this.mouse.y + this.elem.top) - this.offset.top) + this.scroller);
		this.top = (top >= 0) ? top : this.top;
		this.hostEl.style.top = this.top + 'px';

		this.onMove.emit({top: this.top, left: this.left, width: this.width, height: this.height});
		this.moved = true;
	}

	private resizer(e, target) {
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.evaluateScroller();
		let width = 0, height = 0, top = 0, left = 0;
		if (target.className == 'rect top-right') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width + (d.x - this.mouse.x));
			this.width = (width + this.elem.left <= (window.innerWidth - this.offset.right) && width >= this.minimumWidth) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			// height maximal and minimal
			height = this.roundToGrid(this.elem.height - (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight && this.top > 0) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			// top maximal and minimal
			top = this.roundToGrid((d.y - this.mouse.y) + (this.elem.top - this.offset.top) + this.scroller);
			this.top = (top >= 0 && height >= this.minimumHeight) ? top : this.top;
			this.hostEl.style.top = this.top + 'px';

			if (this.width > this.minimumWidth && this.height > this.minimumHeight) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect top-left') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width - (d.x - this.mouse.x));
			this.width = (width >= this.minimumWidth && this.left > 0) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			// left maximal and minimal
			left = this.roundToGrid(((d.x - this.mouse.x) + this.elem.left) - this.offset.left);
			this.left = (left >= 0 && width >= this.minimumWidth) ? left : this.left;
			this.hostEl.style.left = this.left + 'px';

			// height maximal and minimal
			height = this.roundToGrid(this.elem.height - (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight && this.top > 0) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			// top maximal and minimal
			top = this.roundToGrid((d.y - this.mouse.y) + (this.elem.top - this.offset.top) + this.scroller);
			this.top = (top >= 0 && height >= this.minimumHeight) ? top : this.top;
			this.hostEl.style.top = this.top + 'px';

			if (this.height > this.minimumHeight && this.width > this.minimumWidth) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect bottom-left') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width - (d.x - this.mouse.x));
			this.width = (width >= this.minimumWidth && this.left > 0) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			// left maximal and minimal
			left = this.roundToGrid(((d.x - this.mouse.x) + this.elem.left) - this.offset.left);
			this.left = (left >= 0 && width >= this.minimumWidth) ? left : this.left;
			this.hostEl.style.left = this.left + 'px';

			// height maximal and minimal
			height = this.roundToGrid(this.elem.height + (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			if (this.height > this.minimumHeight && this.width > this.minimumWidth) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect bottom-right') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width + (d.x - this.mouse.x));
			this.width = (width + this.elem.left <= (window.innerWidth - this.offset.right) && width >= this.minimumWidth) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			// height maximal and minimal
			height = this.roundToGrid(this.elem.height + (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			if (this.height > this.minimumHeight && this.width > this.minimumWidth) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect center-top') {
			// height maximal and minimal
			height = this.roundToGrid(this.elem.height - (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight && this.top > 0) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			// top maximal and minimal
			top = this.roundToGrid((d.y - this.mouse.y) + (this.elem.top - this.offset.top) + this.scroller);
			this.top = (top >= 0 && height >= this.minimumHeight) ? top : this.top;
			this.hostEl.style.top = this.top + 'px';

			if (this.height > this.minimumHeight) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect center-right') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width + (d.x - this.mouse.x));
			this.width = (width + this.elem.left <= (window.innerWidth - this.offset.right) && width >= this.minimumWidth) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			if (this.width > this.minimumWidth) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect center-bottom') {
			// height maximal and minimal
			height = this.roundToGrid(this.elem.height + (d.y - this.mouse.y));
			this.height = (height >= this.minimumHeight) ? height : this.height;
			this.hostEl.style.height = this.height + 'px';

			if (this.height > this.minimumHeight) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		if (target.className == 'rect center-left') {
			// width maximal and minimal
			width = this.roundToGrid(this.elem.width - (d.x - this.mouse.x));
			this.width = (width >= this.minimumWidth && this.left > 0) ? width : this.width;
			this.hostEl.style.width = this.width + 'px';

			// left maximal and minimal
			left = this.roundToGrid(((d.x - this.mouse.x) + this.elem.left) - this.offset.left);
			this.left = (left >= 0 && width >= this.minimumWidth) ? left : this.left;
			this.hostEl.style.left = this.left + 'px';

			if (this.width > this.minimumWidth) {
				this.onResize.emit({width: this.width, height: this.height});
			}
		}
		this.moved = true;
	}

	private roundToGrid(p) {
		const n = this.settings.app.grid.gridSize;
  return (this.settings.app.grid.enabled ? (p % n < n / 2 ? p - (p % n) : p + n - (p % n)) : p );
  	}

  	private evaluateScroller() {
  		return document.getElementById(this.elemContainer.element.nativeElement.parentNode.id).scrollTop;
  	}
}
