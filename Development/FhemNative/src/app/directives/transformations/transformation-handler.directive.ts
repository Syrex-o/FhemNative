import { Directive, Input, ElementRef, OnChanges, SimpleChanges, Renderer2, HostListener } from '@angular/core';

// Services
import { UndoRedoService } from '../../services/undo-redo.service';
import { StructureService } from '../../services/structure.service';
import { SelectComponentService } from '../../services/select-component.service';

// Interfaces
import { DynamicComponentDefinition, ComponentPosition } from '../../interfaces/interfaces.type';

@Directive({ selector: '[transformation-handler]' })
export class TransformationHandlerDirective implements OnChanges{
	// reference to the element
	private hostEl: HTMLElement;
	// resize rect
	private resizeRect: HTMLElement;
	// container of the current element
	private container: HTMLElement;

	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// rotation ability
	@Input() allowRotation: boolean;

	constructor(
		private undoManager: UndoRedoService,
		private structure: StructureService, 
		private selectComponent: SelectComponentService, 
		private ref: ElementRef,
		private renderer: Renderer2){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	// relevant class touched
	private relevantClassTouched(target: HTMLElement): boolean {
		if(
			target && target.className && Object.prototype.toString.call(target.className) !== '[object SVGAnimatedString]' &&
			target.className.match(/(overlay-move|rect|rotatation-handle)/)
		){
			return true;
		}
		return false;
	}

	ngOnChanges(changes: SimpleChanges) {
		if(this.editingEnabled){
			this.buildResizeRect();
			// assign pinner if needed
			setTimeout(()=>{
				const comp: DynamicComponentDefinition|null = this.structure.getComponent(this.hostEl.id);
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
	onTouchstart(event, target: HTMLElement) {
		if(this.editingEnabled && this.relevantClassTouched(target)){
			// block scroll only for movements of components
			window.ontouchmove = event.preventDefault();
			this.container = this.hostEl.parentElement.parentElement.parentElement;

			const endMove = (): void => {
				// enable scroll again
				window.ontouchmove = null;
				// remove listeners
				document.removeEventListener('mouseup', endMove);
				document.removeEventListener('touchend', endMove);
				this.end();
			}

			// add listeners
			document.addEventListener('mouseup', endMove, {passive: true});
			document.addEventListener('touchend', endMove, {passive: true});
		}
	}

	private end(){
		// update cursor
		this.getCursor();
		// loop components and update
		const changedIDs: string[] = this.selectComponent.selectorList.map(x=> x.ID);
		
		changedIDs.forEach((ID: string)=>{
			const elem: HTMLElement = document.getElementById(ID);
			const component: DynamicComponentDefinition = this.structure.getComponent(ID);

			// change attributes
			const dimensions: {[key: string]: number} = {
				width: elem.offsetWidth,
				height: elem.offsetHeight,
				top: elem.offsetTop,
				left: elem.offsetLeft
			}
			// get rotation if applied
			const rotation: unknown = elem.style.transform.match(/rotate\((\d+)/);
			dimensions['rotation'] = rotation ? parseInt(rotation[1]) : 0;

			// movement and resize callbacks
			this.selectComponent.handles.next({ID: elem.id, forHandle: 'move', dimensions: dimensions});
			this.selectComponent.handles.next({ID: elem.id, forHandle: 'resize', dimensions: dimensions});

			// check for position attribute
			if( !('position' in component) ){
				const modDimensions: ComponentPosition = this.structure.getComponentPositionPixel(component);
				component.position = modDimensions;
			}
			// save the new position
			this.structure.saveItemPosition({
				item: component.position,
				dimensions: dimensions
			}, false);
		});

		// deselect all components
		this.selectComponent.removeContainerCopySelector(this.container, true);
		// add change event
		this.undoManager.addChange();
	}

	// rectangle to move elements
	private buildResizeRect() {
		if (!this.resizeRect) {
			this.resizeRect = this.renderer.createElement('div');
			this.renderer.addClass(this.resizeRect, 'movable');
			this.renderer.appendChild(this.hostEl, this.resizeRect);

			// build resize rect HTML
			let rectConf: string = '<span class="rect top-left"></span>'
				+ '<span class="rect top-right"></span>'
				+ '<span class="rect bottom-left"></span>'
				+ '<span class="rect bottom-right"></span>'
				+ '<span class="rect top-center"></span>'
				+ '<span class="rect left-center"></span>'
				+ '<span class="rect right-center"></span>'
				+ '<span class="rect bottom-center"></span>'
				+ '<span class="overlay-move"></span>';

			if(this.allowRotation){
				rectConf += '<span class="rotatation-handle"></span>';
			}
			// append HTML
			this.renderer.setProperty(this.resizeRect, 'innerHTML', rectConf);
			// get relevant css cursor
			this.getCursor();
		}
	}

	// remove resize rect
	private removeRect(): void {
		if (this.resizeRect) {
			this.renderer.removeChild(this.hostEl, this.resizeRect);
			this.resizeRect = null;
		}
	}

	// get rotation
	private getRotation(): number{
		const rotation: unknown = this.hostEl.style.transform.match(/rotate\((\d+)/);
		return rotation ? parseInt(rotation[1]) : 0;
	}

	// get relevant css cursor
	private getCursor(): void{
		let setStyle = (cssClasses: string[], cursor: string): void =>{
			cssClasses.forEach((cssClass: string)=>{
				let elem: HTMLCollection = this.resizeRect.getElementsByClassName(cssClass);
				this.renderer.setStyle(elem[0], 'cursor', cursor);
			});
		}
		const rotation: number = this.getRotation();

		const degree45: number = Math.round(rotation / 45) * 45 % 180;
		// get relevant cursors
		const center1: string = degree45 === 135 ? "nwse-resize" : degree45 === 45 ? "nesw-resize" : degree45 === 90 ? "ew-resize" : "ns-resize";
		const center2: string = degree45 === 135 ? "nesw-resize" : degree45 === 45 ? "nwse-resize" : degree45 === 90 ? "ns-resize" : "ew-resize";
		const corner1: string = degree45 === 135 ? "ns-resize" : degree45 === 45 ? "ew-resize" : degree45 === 90 ? "nwse-resize" : "nesw-resize";
		const corner2: string = degree45 === 135 ? "ew-resize" : degree45 === 45 ? "ns-resize" : degree45 === 90 ? "nesw-resize" : "nwse-resize";
		
		// set styles
		setStyle(['top-center', 'bottom-center'], center1);
		setStyle(['left-center', 'right-center'], center2);
		setStyle(['top-right', 'bottom-left'], corner1);
		setStyle(['top-left', 'bottom-right'], corner2);
	}
}