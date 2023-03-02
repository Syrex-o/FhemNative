import { Directive, Input, ElementRef, OnChanges, SimpleChanges, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { StructureService } from '../../services/structure.service';
import { EventHandlerService } from '../../services/event-handler.service';
import { SelectComponentService } from '../../services/select-component.service';

// Interfaces
import { DynamicComponentDefinition, ComponentPosition } from '../../interfaces/interfaces.type';

@Directive({ selector: '[transformation-handler]' })
export class TransformationHandlerDirective implements OnChanges, OnDestroy{
	// move handle ID
	private handleID: string = this.settings.getUID();
	// reference to the element
	private hostEl: HTMLElement;
	// resize rect
	private resizeRect!: HTMLElement|null;
	// container of the current element
	private container!: HTMLElement|null;
	

	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// rotation ability
	@Input() allowRotation: boolean = false;

	constructor(
		private cdr: ChangeDetectorRef,
		private ref: ElementRef,
		private renderer: Renderer2,
		private settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	// relevant class touched
	private relevantClassTouched(target: HTMLElement): boolean {
		if( target.className.match(/(overlay-move|rect|rotatation-handle)/) ){
			return true;
		}
		return false;
	}

	ngOnChanges(changes: SimpleChanges) {
		if(this.editingEnabled){
			this.buildResizeRect();
			// build event handler
			this.buildEventHandler();
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

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.handleID);
		// start event
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			if(this.editingEnabled && this.relevantClassTouched(target) && this.hostEl.parentElement && this.hostEl.parentElement.parentElement){
				// disable swipe menu
				this.settings.disableSwipeMenu = true;

				this.container = this.hostEl.parentElement.parentElement.parentElement;
				if(this.container){
					this.container.style.overflowY = 'hidden';
				}

				const endMove = (e: TouchEvent|MouseEvent): void => {
					// remove listeners
					document.removeEventListener('mouseup', endMove);
					document.removeEventListener('touchend', endMove);
					this.end();
				}

				document.addEventListener('mouseup', endMove, {passive: true});
				document.addEventListener('touchend', endMove, {passive: true});
			}
		}
		this.eventHandler.handle(this.handleID, this.ref.nativeElement, startMove);
	}

	private end(){
		// update cursor
		this.getCursor();
		// loop components and update
		const changedIDs: Array<any> = this.selectComponent.selectorList.map(x=> x.ID) || [];
		// check if component moved/resized/rotated
		let changedAny: boolean = false;
		
		changedIDs.forEach((ID: string)=>{
			const elem: HTMLElement|null = document.getElementById(ID);
			if(elem){
				const component: DynamicComponentDefinition|null = this.structure.getComponent(ID);
				// change attributes
				const dimensions: {[key: string]: number} = {
					width: elem.offsetWidth,
					height: elem.offsetHeight,
					top: elem.offsetTop,
					left: elem.offsetLeft
				}

				// get rotation if applied
				const rotation: RegExpMatchArray|null = elem.style.transform.match(/rotate\((\d+)/);
				dimensions['rotation'] = rotation ? parseInt(rotation[1]) : 0;

				// movement and resize callbacks
				this.selectComponent.handles.next({ID: elem.id, forHandle: 'move', dimensions: dimensions});
				this.selectComponent.handles.next({ID: elem.id, forHandle: 'resize', dimensions: dimensions});

				// check for position attribute
				if(component){
					if(!('position' in component) ){
						const modDimensions: ComponentPosition = this.structure.getComponentPositionPixel(component);
						component.position = modDimensions;
					}
					// component position in structure
					if(component.position){
						const structureDimensions: ComponentPosition = component.position;
						// check for change
						if( 
							parseInt(structureDimensions.width) !== dimensions.width ||
							parseInt(structureDimensions.height) !== dimensions.height ||
							parseInt(structureDimensions.top) !== dimensions.top ||
							parseInt(structureDimensions.left) !== dimensions.left ||
							parseInt(structureDimensions.rotation) !== dimensions.rotation
						){
							changedAny = true;
						}
					}
					// save the new position
					this.structure.saveItemPosition({ item: component.position, dimensions: dimensions }, false);
				}
			}
		});
		if(changedAny){
			// add change event
			this.undoManager.addChange();
			// deselect all components
			this.selectComponent.removeContainerCopySelector(this.container, true);
		}

		if(this.container) this.container.style.overflowY = 'auto';

		// enable swipe menu
		this.settings.disableSwipeMenu = false;
		this.cdr.detectChanges();
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
		const rotation: RegExpMatchArray|null = this.hostEl.style.transform.match(/rotate\((\d+)/);
		return rotation ? parseInt(rotation[1]) : 0;
	}

	// get relevant css cursor
	private getCursor(): void{
		let setStyle = (cssClasses: string[], cursor: string): void =>{
			cssClasses.forEach((cssClass: string)=>{
				if(this.resizeRect){
					let elem: HTMLCollection = this.resizeRect.getElementsByClassName(cssClass);
					this.renderer.setStyle(elem[0], 'cursor', cursor);
				}
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

	ngOnDestroy(){
		this.eventHandler.removeHandle(this.handleID);
	}
}