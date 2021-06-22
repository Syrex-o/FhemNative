import { Directive, Input, ElementRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { EventHandlerService } from '../../services/event-handler.service';
import { SelectComponentService } from '../../services/select-component.service';

@Directive({ selector: '[rotator]' })
export class RotatorDirective implements AfterViewInit, OnDestroy{
	// move handle ID
	private handleID: string = this.settings.getUID();
	// reference to the element
	private hostEl: HTMLElement;
	private elemCenter: {x: number, y: number} = {x: 0, y: 0};
	// offset
	private offset: {top: number, left: number, right: number, scroller: number} = {top: 56, left: 0, right: 0, scroller: 0};
	private prevR!: number;

	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// rotation ability
	@Input() allowRotation: boolean = false;

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

	// relevant class touched
	private relevantClassTouched(target: HTMLElement): boolean {
		if( target.className.match(/rotatation-handle/) && !this.hostEl.classList.contains('pinned') ){
			return true;
		}
		return false;
	}

	ngAfterViewInit(){
		this.buildEventHandler();
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.handleID);
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			if(this.editingEnabled && this.relevantClassTouched(target)){
				// add current item to selector list
				this.selectComponent.buildCopySelectorForRelevant(this.hostEl.id);
				this.getStartParams();

				const whileMove = (e: TouchEvent|MouseEvent): void => {
					this.zone.runOutsideAngular(()=>{
						this.move(e);
					});
				}

				const endMove = (): void => {
					// remove listeners
					document.removeEventListener('mousemove', whileMove);
					document.removeEventListener('touchmove', whileMove);
					document.removeEventListener('mouseup', endMove);
					document.removeEventListener('touchend', endMove);
				}

				// add listeners
				document.addEventListener('mousemove', whileMove, {passive: true});
				document.addEventListener('touchmove', whileMove, {passive: true});
				document.addEventListener('mouseup', endMove, {passive: true});
				document.addEventListener('touchend', endMove, {passive: true});
			}
		}
		this.eventHandler.handle(this.handleID, this.ref.nativeElement, startMove);
	}

	// get start params
	private getStartParams(): void{
		const elem: ClientRect = this.hostEl.getBoundingClientRect();
		this.elemCenter = {
			x: elem.left + elem.width / 2,
			y: elem.top + elem.height / 2
		};
		// get offsets
		const res: {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} = this.structure.getOffsets(this.hostEl);
		this.offset = res.offsets;
	}

	private move(e: TouchEvent|MouseEvent): void {
		const d: {x: number, y: number} = this.structure.getMousePosition(event)
		const radians: number = Math.atan2(
			this.structure.roundToGrid(d.x - this.elemCenter.x), 
			this.structure.roundToGrid(d.y - this.elemCenter.y)
		);
		const degree: number = (radians * (180 / Math.PI) * -1) + 180;
		this.hostEl.style.transform = 'rotate('+degree+'deg)';

		const bound: ClientRect = this.hostEl.getBoundingClientRect();
		const limitL: boolean = this.structure.roundToGrid(bound.left - this.offset.left) >= 0 ? true : false;
		const limitH: boolean = this.structure.roundToGrid(bound.top - this.offset.top + this.offset.scroller) >= 0 ? true : false;
		const limitW: boolean = this.structure.roundToGrid((bound.left + bound.width) - (window.innerWidth - this.offset.right)) <= 0 ? true : false;

		// limits
		if(limitL && limitH && limitW){
			this.prevR = degree;
		}else{
			this.hostEl.style.transform = 'rotate('+this.prevR+'deg)';
		}
	}

	ngOnDestroy(){
		this.eventHandler.removeHandle(this.handleID);
	}
}