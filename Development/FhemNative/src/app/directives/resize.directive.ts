import { Directive, Input, ElementRef, OnChanges, SimpleChanges, EventEmitter, OnInit, Renderer2, HostListener } from '@angular/core';

// Services
import { ComponentLoaderService } from '../services/component-loader.service';
import { SelectComponentService } from '../services/select-component.service';
import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
import { UndoRedoService } from '../services/undo-redo.service';

@Directive({ selector: '[resize]' })
export class ResizeDirective implements OnChanges, OnInit {
	// reference to the element
	private hostEl: HTMLElement;
	// resize rect
	private resizeRect: HTMLElement;
	// container of the current element
	private container: HTMLElement;

	// movement properties
	// trigger once per movement
	private startMove: boolean = false;
	// determine if element was moved
	private moved: boolean = false;
	// determine if element was resized
	private resized: boolean = false;
	// mouse
	private mouse: any = {x: 0, y: 0};
	// scroll position
	private scroller = 0;
	// offset
	private offset: any = {top: 56, left: 0, right: 0};
	// list of elements from selection
	private elemList: any = {
		elements: [],
		components: [],
		width: [],
		height: [],
		top: [],
		left: []
	};
	// rescale timeout
	private rescaleTimeout: any;


	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// component info
	@Input() minimumWidth: number;
	@Input() minimumHeight: number;

	constructor(
		private ref: ElementRef,
		private renderer: Renderer2,
		private componentLoader: ComponentLoaderService,
		private selectComponent: SelectComponentService,
		private settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	ngOnInit() {
		this.container = this.hostEl.parentElement.parentElement.parentElement;
		// check for resize
		this.resizeElemFromWindow();
	}

	// resize handler
	@HostListener('window:resize')
	onDeviceRotation(){
		this.resizeElemFromWindow();
	}

	ngOnChanges(changes: SimpleChanges) {
		if(this.editingEnabled){
			this.buildResizeRect();
			// assign pinner if needed
			setTimeout(()=>{
				let comp = this.structure.getComponent(this.hostEl.id);
				if(comp && comp.pinned){
					this.renderer.addClass(this.hostEl, 'pinned');
				}
			});
		}else{
			this.removeRect();
			this.renderer.removeClass(this.hostEl, 'pinned');
		}
	}

	// mouse/touch movement
	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if(this.editingEnabled){
			// block scroll only for movements of components
			if(target && target.className && target.className.match(/(rect|overlay-move)/)){
				window.ontouchmove = event.preventDefault();
			}
			// one start 
			this.startMove = true;
			// get the starting properties
			this.mouse.x = event.pageX || (event.touches ? event.touches[0].clientX : 0);
			this.mouse.y = event.pageY || (event.touches ? event.touches[0].clientY : 0);
			this.offset = {top: 56, left: 0, right: 0};
			// get container properties
			const container: ClientRect = this.container.getBoundingClientRect();
			this.offset.top = container.top;
			this.offset.left = container.left;
			this.offset.right = window.innerWidth - (container.left + container.width);

			const endMove = () => {
				// enable scroll again
				window.ontouchmove = null;
				// remove listeners
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);
	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);

	   			// save the item position, if the element was moved
	   			if (this.moved || this.resized) {
	   				// deselect all components
					this.selectComponent.removeContainerCopySelector(this.container, true);
					// loop items
	   				this.loopItems(this.elemList.elements, (elem, i)=>{
	   					const dimensions = {
							width: this.elemList.width[i],
							height: this.elemList.height[i],
							top: this.elemList.top[i],
							left: this.elemList.left[i]
						}
						// callbacks of resize and move
						if(this.moved){
							this.selectComponent.handles.next({ID: elem.id, forHandle: 'move', dimensions: dimensions});
						}else{
							this.selectComponent.handles.next({ID: elem.id, forHandle: 'resize', dimensions: dimensions});
						}
						// save the new position
						const selected = this.structure.getComponent(elem.id).position;
						this.structure.saveItemPosition({
							item: selected,
							dimensions: dimensions
						}, false);
	   				});
	   				// add change event
					this.undoManager.addChange();
	   				// reset values
	   				this.moved = false;
	   				this.resized = false;
	   			}
			}

			const whileMove = (e) => {
				if(this.startMove){
					this.selectComponent.buildCopySelectorForRelevant(this.hostEl.id);
					// get the item position
					this.getItemPos();
				}
				this.startMove = false;
				if (target.className === 'overlay-move') {
					this.moveComponents(e);
				}else{
					this.resizeComponents(e, target);
				}
			}

			window.addEventListener('mousemove', whileMove);
	  		window.addEventListener('mouseup', endMove);
	  		window.addEventListener('touchmove', whileMove);
	  		window.addEventListener('touchend', endMove);
		}
	}

	// resize elem based on needs
	resizeElemFromWindow(){
		if (this.settings.app.responsiveResize) {
			// transform component
			let transformer = ( component: any, attributes: {[key: string]: string | null} )=>{
				if(this.rescaleTimeout) clearTimeout(this.rescaleTimeout);
				this.rescaleTimeout = setTimeout(()=>{
					// adding transition style: like in popup
		  			this.hostEl.style.transition = 'all .3s cubic-bezier(.17,.67,.54,1.3)';

		  			// filter attributes for not null
		  			attributes = Object.entries(attributes).reduce((a,[k,v]) => (v === null ? a : {...a, [k]:v}), {});

		  			for(const [key, value] of Object.entries(attributes)){
		  				this.hostEl.style[key] = value;
		  			}
		  			// save values
		  			component.createScaler = {width: window.innerWidth, height: window.innerHeight};
		  			this.structure.saveItemPosition({
		  				item: component.position,
		  				dimensions: attributes
		  			}, true);

		  			// reset style attr
		  			const timeout = setTimeout(() => {
	  					this.hostEl.style.transition = 'all 0ms linear';
	  				}, 300);
				}, 300);
			}
			// find component
			const component = this.structure.getComponent(this.hostEl.id);
			if(component){
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

				let newComponentPosition: {[key: string]: string | null} = {
					width: null, height: null, top: null, left: null
				}

				// find components with different create scaler
				if (window.innerWidth !== scaler.width || window.innerHeight !== scaler.height) {
					const w: number = parseInt(position.width);
					const h: number = parseInt(position.height);
					const t: number = parseInt(position.top);
					const l: number = parseInt(position.left);

					const scaleW: number = w / scaler.width;
					const scaleL: number = l / scaler.width;

					// new width
					let newWidth: number = Math.round(this.roundToGrid( window.innerWidth * scaleW ));
					newWidth = newWidth >= this.minimumWidth ? newWidth : this.minimumWidth;
					if(newWidth !== w){
						newComponentPosition.width = newWidth + 'px';
					}

					// new height
					const scaleHeightFactor: number = newWidth / w;
					let newHeight: number = Math.round(this.roundToGrid( h * scaleHeightFactor ));
					newHeight = newHeight >= this.minimumHeight ? newHeight : this.minimumHeight;
					if(newHeight !== h){
						newComponentPosition.height = newHeight + 'px';
					}
					// new top
					let newTop: number = Math.round(this.roundToGrid( t * scaleHeightFactor ));
					newTop = newTop >= 0 ? newTop : 0;
					if(newTop !== t){
						newComponentPosition.top = newTop + 'px';
					}
					// new left
					let newLeft: number = Math.round(this.roundToGrid( window.innerWidth * scaleL ));
					newLeft = newLeft <= 0 ? 0 : newLeft;
					if(newLeft !== l){
						newComponentPosition.left = newLeft + 'px';
					}

					// // transform component
					transformer(component, newComponentPosition);
				}
			}
		}
	}

	// rectangle to move elements
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
	
	// remove resize rect
	private removeRect() {
		if (this.resizeRect) {
			this.renderer.removeChild(this.hostEl, this.resizeRect);
			this.resizeRect = null;
		}
	}

	// selection list looper
	private loopItems(list: Array<any>, callback?: any){
		list.forEach((item, i: number)=>{
			callback(item, i);
		});
	}

	// get position of selected elements
	private getItemPos(){
		// reset values
		this.elemList.elements = [];
		this.elemList.components = [];
		this.elemList.width = [];
		this.elemList.height = [];
		this.elemList.top = [];
		this.elemList.left = [];

		this.selectComponent.selectorList.forEach((component)=>{
			const el = document.getElementById(component.ID);
			const bounding: ClientRect = el.getBoundingClientRect();
			// add elements
			this.elemList.elements.push(el);
			this.elemList.components.push(bounding);
			this.elemList.width.push(bounding.width);
			this.elemList.height.push(bounding.height);
			this.elemList.top.push(bounding.top - this.offset.top);
			this.elemList.left.push(bounding.left - this.offset.left);
		});
	}

	// component mover
	private moveComponents(e){
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.scrollPosition();
		// move each element in stack
		this.loopItems(this.elemList.components, (elem, i)=>{
			// left positioning
			const left = this.roundToGrid((d.x - this.mouse.x + elem.left) - this.offset.left);
			this.elemList.left[i] = (left >= 0 && left + elem.width + this.offset.left <= (window.innerWidth - this.offset.right)) ? left : this.elemList.left[i];
			this.elemList.elements[i].style.left = this.elemList.left[i] + 'px';
			// top positioning
			const top = this.roundToGrid(((d.y - this.mouse.y + elem.top) - this.offset.top) + this.scroller);
			this.elemList.top[i] = (top >= 0) ? top : this.elemList.top[i];
			this.elemList.elements[i].style.top = this.elemList.top[i] + 'px';
		});
		// calc difference to check if movement happened
		this.moved = true;
	}

	// component resizer
	private resizeComponents(e, target){
		e.preventDefault();
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
		};
		this.scroller = this.scrollPosition();

		let width = 0, height = 0, left = 0, top = 0;

		if(target.className.match(/(rect.*(-right|right-))/)){
			this.loopItems(this.elemList.components, (elem, i)=>{
				// width maximal and minimal
				width = this.roundToGrid(elem.width + (d.x - this.mouse.x));
				this.elemList.width[i] = (width + elem.left <= (window.innerWidth - this.offset.right) && width >= this.minimumWidth) ? width : this.elemList.width[i];
				this.elemList.elements[i].style.width = this.elemList.width[i] + 'px';
			});
			this.resized = true;
		}
		if(target.className.match(/(rect.*(-left|left-))/)){
			this.loopItems(this.elemList.components, (elem, i)=>{
				// width maximal and minimal
				width = this.roundToGrid(elem.width - (d.x - this.mouse.x));
				this.elemList.width[i] = (width >= this.minimumWidth && this.elemList.left[i] > 0) ? width : this.elemList.width[i];
				this.elemList.elements[i].style.width = this.elemList.width[i] + 'px';

				// left maximal and minimal
				left = this.roundToGrid(((d.x - this.mouse.x) + elem.left) - this.offset.left);
				this.elemList.left[i] = (left >= 0 && width >= this.minimumWidth) ? left : this.elemList.left[i];
				this.elemList.elements[i].style.left = this.elemList.left[i] + 'px';
			});
			this.resized = true;
		}
		if(target.className.match(/(rect.*(top-))/)){
			this.loopItems(this.elemList.components, (elem, i)=>{
				// height maximal and minimal
				height = this.roundToGrid(elem.height - (d.y - this.mouse.y));
				this.elemList.height[i] = (height >= this.minimumHeight && this.elemList.top[i] > 0) ? height : this.elemList.height[i];
				this.elemList.elements[i].style.height = this.elemList.height[i] + 'px';

				// top maximal and minimal
				top = this.roundToGrid(((d.y - this.mouse.y + elem.top) - this.offset.top) + this.scroller);
				this.elemList.top[i] = (top >= 0 && height >= this.minimumHeight) ? top : this.elemList.top[i];
				this.elemList.elements[i].style.top = this.elemList.top[i] + 'px';
			});
			this.resized = true;
		}
		if(target.className.match(/(rect.*(bottom-))/)){
			this.loopItems(this.elemList.components, (elem, i)=>{
				// height maximal and minimal
				height = this.roundToGrid(elem.height + (d.y - this.mouse.y));
				this.elemList.height[i] = (height >= this.minimumHeight) ? height : this.elemList.height[i];
				this.elemList.elements[i].style.height = this.elemList.height[i] + 'px';
			});
			this.resized = true;
		}
		// detect changes
		if(width !== 0 || height !== 0 || left !== 0 || top !== 0){
			// loop items
	   		this.loopItems(this.elemList.elements, (elem, i)=>{
	   			const dimensions = {
					width: this.elemList.width[i],
					height: this.elemList.height[i],
					top: this.elemList.top[i],
					left: this.elemList.left[i]
				}
				this.selectComponent.handles.next({ID: elem.id, forHandle: 'whileResize', dimensions: dimensions});
			});
		}
	}

	// move and resize based on grid
	private roundToGrid(p) {
		const n = this.settings.app.grid.gridSize;
  		return (this.settings.app.grid.enabled ? (p % n < n / 2 ? p - (p % n) : p + n - (p % n)) : p );
  	}

	// evaluate the scroll position
	private scrollPosition(){
		return this.container.scrollTop;
	}
}