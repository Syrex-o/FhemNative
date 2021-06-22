import { Directive, Input, ElementRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { EventHandlerService } from '../../services/event-handler.service';
import { SelectComponentService } from '../../services/select-component.service';

// Interfaces
import { ElementPosition, DynamicComponentDefinition } from '../../interfaces/interfaces.type';

@Directive({ selector: '[mover]' })
export class MoverDirective implements AfterViewInit, OnDestroy{
	// move handle ID
	private handleID: string = this.settings.getUID();
	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// reference to the element
	private hostEl!: HTMLElement;
	private container!: HTMLElement;

	// grouped or multiple selected components can be moved together --> elemPos as array of selected elements
	private elemPos: {elements: HTMLElement[], positions: ElementPosition[], offsets: ElementPosition[]} = {
		elements: [],
		positions: [],
		offsets: []
	};

	// offset
	private offset: {top: number, left: number, right: number, scroller: number} = {top: 56, left: 0, right: 0, scroller: 0};
	// get previous container height, to evaluate grid update
	private prevContainerHeight: number = 0;

	constructor(
		private zone: NgZone,
		private ref: ElementRef,
		private settings: SettingsService,
		private structure: StructureService, 
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	// get scroll offset
	private getScrollPosition(): number { return this.container.scrollTop; }

	// get elem pos
	private getElemPos(): void{
		this.elemPos = { elements: [], positions: [], offsets: [] };
		this.selectComponent.selectorList.forEach((component: DynamicComponentDefinition)=>{
			if(component.ID){
				const el: HTMLElement|null = document.getElementById(component.ID);
				if (el){
					const bounding: ClientRect = el.getBoundingClientRect();
					// push relevant attributs
					this.elemPos.elements.push(el);
					this.elemPos.positions.push(bounding);
					this.elemPos.offsets.push({
						top: el.offsetTop,
						left: el.offsetLeft,
						width: el.offsetWidth,
						height: el.offsetHeight
					});
				}
			}
		});
		// container height on start movement
		this.prevContainerHeight = this.container.scrollHeight;
	}

	// relevant class touched
	private relevantClassTouched(target: HTMLElement): boolean {
		if( target.className.match(/overlay-move/) ){
			return true;
		}
		return false;
	}

	ngAfterViewInit(){
		this.buildEventHandler();
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.handleID);
		// start event
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			if(this.editingEnabled && this.relevantClassTouched(target)){
				const res: {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} = this.structure.getOffsets(this.hostEl);
				this.container = res.container;
				this.offset = res.offsets;
				// add current item to selector list
				this.selectComponent.buildCopySelectorForRelevant(this.hostEl.id);
				// get element position
				this.getElemPos();

				const whileMove = (e: MouseEvent|TouchEvent): void => {
					this.zone.runOutsideAngular(()=>{
						this.move(startMouse, e);
					});
				}

				const endMove = (): void => {
					// remove listeners
					document.removeEventListener('mousemove', whileMove);
					document.removeEventListener('touchmove', whileMove);
					document.removeEventListener('mouseup', endMove);
					document.removeEventListener('touchend', endMove);
					this.end();
				}

				document.addEventListener('mousemove', whileMove, {passive: true});
				document.addEventListener('touchmove', whileMove, {passive: true});
				document.addEventListener('mouseup', endMove, {passive: true});
				document.addEventListener('touchend', endMove, {passive: true});
			}
		}
		this.eventHandler.handle(this.handleID, this.ref.nativeElement, startMove);
	}

	private move(startMouse: {x: number, y: number}, e: MouseEvent|TouchEvent): void{
		const delta: {x: number, y: number} = this.structure.getMouseDelta(startMouse, e);
		this.offset.scroller = this.getScrollPosition();

		let tops: number[] = [];
		let lefts: number[] = [];

		let blockTop: boolean = false;
		let blockLeft: boolean = false;

		// loop items to allow multiple component movement
		this.elemPos.elements.forEach((elem: HTMLElement, i: number)=>{
			// left position based on current rotation
			// left position without rotation 
			const left: number = this.structure.roundToGrid(delta.x + this.elemPos.offsets[i].left);
			const leftNeutral: number = this.structure.roundToGrid((delta.x + this.elemPos.positions[i].left) - this.offset.left);

			// top position based on current rotation
			// top position without rotation
			const top: number = this.structure.roundToGrid( delta.y + this.elemPos.offsets[i].top );
			const topNeutral: number = ((delta.y + this.elemPos.positions[i].top) - this.offset.top + this.offset.scroller);

			// width + left position without rotation
			const rightNeutral: number = this.structure.roundToGrid( leftNeutral + this.elemPos.positions[i].width + this.offset.left );
			const rightLimiter: number = this.structure.roundToGrid(window.innerWidth - this.offset.right);
			// move left
			if( leftNeutral >= 0 && rightNeutral <= rightLimiter ){
				lefts.push(left);
			}else{
				blockLeft = true;
			}
			// move top
			if(topNeutral >= 0){
				tops.push(top);
			}else{
				blockTop = true;
			}
		});

		// check for blocking, when multiple elements are dragged --> prevent movement of one component, when other already hit limit
		this.elemPos.elements.forEach((elem: HTMLElement, i: number)=>{
			if(!blockLeft){
				elem.style.left = lefts[i] + 'px';
			}
			if(!blockTop){
				elem.style.top = tops[i] + 'px';
			}
		});
	}

	private end(): void{
		// check for grid resizing
		if(this.prevContainerHeight !== this.container.scrollHeight){
			this.selectComponent.handles.next({ID: this.hostEl.id, forHandle: 'move', dimensions: {}});
		}
	}

	ngOnDestroy(){
		this.eventHandler.removeHandle(this.handleID);
	}
}