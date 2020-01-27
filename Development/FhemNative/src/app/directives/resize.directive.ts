import { Directive, Input, ElementRef, OnChanges, SimpleChanges, Output, EventEmitter, AfterViewInit, Renderer2, HostListener } from '@angular/core';

import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
import { CreateComponentService } from '../services/create-component.service';
import { SelectComponentService } from '../services/select-component.service';
import { UndoRedoService } from '../services/undo-redo.service';

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

	private elemContainer: any;

	private mouse: any = {x: 0, y: 0};
	private scroller = 0;

	private offset: any = {top: 56, left: 0, right: 0};

	private moved = false;

	// trigger once per movement
	private startMove: boolean = false;

	// Testing
	private elemList: any = {
		elements: [],
		components: [],
		width: [],
		height: [],
		top: [],
		left: []
	};

	constructor(
		private ref: ElementRef,
		private settings: SettingsService,
		private structure: StructureService,
		private renderer: Renderer2,
		private createComponent: CreateComponentService,
		private selectComponent: SelectComponentService,
		private undoManager: UndoRedoService) {
		this.hostEl = ref.nativeElement;
	}

	ngAfterViewInit() {
		this.createComponent.containerComponents.find((x) => {
			if (x.ID === this.hostEl.id) {
				this.elemContainer = this.structure.getComponentContainerRaw(x);
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
			// block scroll only for movements of components
			if(target && target.className && target.className.match(/(rect|overlay-move)/)){
				window.ontouchmove = event.preventDefault();
			}
			// one start 
			this.startMove = true;

			this.getStartPos(event);

	    	// getting container offsets
	  		const container: any = document.getElementById(this.elemContainer.element.nativeElement.parentNode.id).getBoundingClientRect();
			this.offset.top = container.y;
			this.offset.left = container.x;
			this.offset.right = window.innerWidth - (container.x + container.width);

			const endMove = () => {
				// enable scroll
				window.ontouchmove = null;

				// remove listeners
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);

	        	// save the item position, if the element was moved
	   			if (this.moved) {
	   				this.moved = false;
					this.selectComponent.removeContainerCopySelector(false, true);

					this.elemList.elements.forEach((elem, i)=>{
						const selected = this.structure.getComponent(elem.id).position;
						this.structure.saveItemPosition({
							item: selected,
							dimensions: {
								width: this.elemList.width[i],
								height: this.elemList.height[i],
								top: this.elemList.top[i],
								left: this.elemList.left[i]
							}
						}, false);
						this.emitHostEvent('resized', i);
					});
					// add change event
					this.undoManager.addChange();
				}
			};
			const whileMove = (e) => {
				if(!this.selectComponent.evalCopySelector(this.hostEl.id) && this.startMove){
					this.selectComponent.removeContainerCopySelector(false, true);
					this.selectComponent.buildCopySelector(this.hostEl.id, false, this.elemContainer);
				}
				if(this.startMove){
					this.getItemPos(e);
				}
				this.startMove = false;
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
			setTimeout(()=>{
				let comp = this.structure.getComponent(this.hostEl.id);
				if(comp && comp.pinned){
					this.hostEl.classList.add('pinned');
				}
			}, 0);
		} else {
			this.removeRect();
			this.hostEl.classList.remove('pinned');
		}
	}

	private responseToDeviceChange() {
		// resize component if needed
		if (this.settings.app.responsiveResize) {
			const component = this.structure.getComponent(this.hostEl.id);
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

				let w = Math.round(this.roundToGrid(width / scaler.width * window.innerWidth));
				const l = Math.round(this.roundToGrid(left / scaler.width * window.innerWidth));

  				// check, that components are not smaller that allowed
  				w = w >= this.minimumWidth ? w : this.minimumWidth;

  				// adding transition style: like in popup
  				this.hostEl.style.transition = 'all .3s cubic-bezier(.17,.67,.54,1.3)';

  				this.hostEl.style.width = w + 'px';
  				this.hostEl.style.left = l + 'px';

  				// removing transition style
  				const timeout = setTimeout(() => {
  					this.hostEl.style.transition = 'all 0ms linear';
  				}, 300);

  				// save options
  				component.createScaler = {width: window.innerWidth, height: window.innerHeight};
				this.structure.saveItemPosition({
					item: component.position,
					dimensions: {
						width: w,
						left: l
					},
				}, true);
				this.onResize.emit({
					width: w, 
					height: parseInt(this.hostEl.style.height),
					left: l,
					top: parseInt(this.hostEl.style.top)
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
				+ '<span class="rect top-center"></span>'
				+ '<span class="rect left-center"></span>'
				+ '<span class="rect right-center"></span>'
				+ '<span class="rect bottom-center"></span>'
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

	private getStartPos(e) {
		// mouse Position
		this.mouse.x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		this.mouse.y = e.pageY || (e.touches ? e.touches[0].clientY : 0);
		this.offset = {top: 56, left: 0, right: 0};
	}

	private getItemPos(e){
		this.elemList.elements = [];
		this.elemList.components = [];
		this.elemList.width = [];
		this.elemList.height = [];
		this.elemList.top = [];
		this.elemList.left = [];

		this.selectComponent.selectorList.forEach((selector)=>{
			const el = document.getElementById(selector.ID);
			const bounding:any = el.getBoundingClientRect();
			this.elemList.elements.push(el);
			this.elemList.components.push(bounding);
			this.elemList.width.push(bounding.width);
			this.elemList.height.push(bounding.height);
			this.elemList.top.push(bounding.y - this.offset.top);
			this.elemList.left.push(bounding.x - this.offset.left);
		});
	}

	// relevant callback (onmove, onresize)
	private emitHostEvent(callbackEvent, index){
		this[callbackEvent].emit({top: this.elemList.top[index], left: this.elemList.left[index], width: this.elemList.width[index], height: this.elemList.height[index]});
	}

	private mover(e) {
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.evaluateScroller();

		// move each element in stack
		this.elemList.components.forEach((elem, i)=>{
			// left positioning
			const left = this.roundToGrid((d.x - this.mouse.x + elem.left) - this.offset.left);
			this.elemList.left[i] = (left >= 0 && left + elem.width + this.offset.left <= (window.innerWidth - this.offset.right)) ? left : this.elemList.left[i];
			this.elemList.elements[i].style.left = this.elemList.left[i] + 'px';

			// top positioning
			const top = this.roundToGrid(((d.y - this.mouse.y + elem.top) - this.offset.top) + this.scroller);
			this.elemList.top[i] = (top >= 0) ? top : this.elemList.top[i];
			this.elemList.elements[i].style.top = this.elemList.top[i] + 'px';

			// emit onMove event
			this.emitHostEvent('onMove', i);
		});
		this.moved = true;
	}

	private resizer(e, target) {
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.evaluateScroller();

		if(target.className.match(/(rect.*(-right|right-))/)){
			this.elemList.components.forEach((elem, i)=>{
				// width maximal and minimal
				const width = this.roundToGrid(elem.width + (d.x - this.mouse.x));
				this.elemList.width[i] = (width + elem.left <= (window.innerWidth - this.offset.right) && width >= this.minimumWidth) ? width : this.elemList.width[i];
				this.elemList.elements[i].style.width = this.elemList.width[i] + 'px';
			});
		}
		if(target.className.match(/(rect.*(-left|left-))/)){
			this.elemList.components.forEach((elem, i)=>{
				// width maximal and minimal
				const width = this.roundToGrid(elem.width - (d.x - this.mouse.x));
				this.elemList.width[i] = (width >= this.minimumWidth && this.elemList.left[i] > 0) ? width : this.elemList.width[i];
				this.elemList.elements[i].style.width = this.elemList.width[i] + 'px';

				// left maximal and minimal
				const left = this.roundToGrid(((d.x - this.mouse.x) + elem.left) - this.offset.left);
				this.elemList.left[i] = (left >= 0 && width >= this.minimumWidth) ? left : this.elemList.left[i];
				this.elemList.elements[i].style.left = this.elemList.left[i] + 'px';
			});
		}
		if(target.className.match(/(rect.*(top-))/)){
			this.elemList.components.forEach((elem, i)=>{
				// height maximal and minimal
				const height = this.roundToGrid(elem.height - (d.y - this.mouse.y));
				this.elemList.height[i] = (height >= this.minimumHeight && this.elemList.top[i] > 0) ? height : this.elemList.height[i];
				this.elemList.elements[i].style.height = this.elemList.height[i] + 'px';

				// top maximal and minimal
				const top = this.roundToGrid(((d.y - this.mouse.y + elem.top) - this.offset.top) + this.scroller);
				this.elemList.top[i] = (top >= 0 && height >= this.minimumHeight) ? top : this.elemList.top[i];
				this.elemList.elements[i].style.top = this.elemList.top[i] + 'px';
			});
		}
		if(target.className.match(/(rect.*(bottom-))/)){
			this.elemList.components.forEach((elem, i)=>{
				const height = this.roundToGrid(elem.height + (d.y - this.mouse.y));
				this.elemList.height[i] = (height >= this.minimumHeight) ? height : this.elemList.height[i];
				this.elemList.elements[i].style.height = this.elemList.height[i] + 'px';
			});
		}
		// emit onResize
		this.elemList.components.forEach((elem, i)=>{
			if (this.elemList.width[i] > this.minimumWidth && this.elemList.height[i] > this.minimumHeight) {
				this.emitHostEvent('onResize', i);
			}
		});

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
