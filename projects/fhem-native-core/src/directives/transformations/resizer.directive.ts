import { Directive, Input, ElementRef, HostListener, NgZone, AfterViewInit, OnDestroy } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { EventHandlerService } from '../../services/event-handler.service';
import { SelectComponentService } from '../../services/select-component.service';

// Interfaces
import { ElementPosition } from '../../interfaces/interfaces.type';

@Directive({ selector: '[resizer]' })
export class ResizerDirective implements AfterViewInit, OnDestroy{
	// move handle ID
	private handleID: string = this.settings.getUID();
	// reference to the element
	private hostEl: HTMLElement;
	private container!: HTMLElement;

	private elemPos: { element: HTMLElement|null, position: ElementPosition } = {
		element: null,
		position: {top: 0, left: 0, width: 0, height: 0}
	}

	private resizeMatrix!: {a: 1|0, b: 1|0, c: 1|0, d: 1|0};
	private rotation: number = 0;

	private qp0_x!: number;
	private qp0_y!: number;
	private pp_x!: number;
	private pp_y!: number;

	private prevL!: number;
	private prevT!: number;
	private prevH!: number;
	private prevW!: number;

	// offset
	private offset: {top: number, left: number, right: number, scroller: number} = {top: 56, left: 0, right: 0, scroller: 0};

	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// component info
	@Input() minimumWidth!: number;
	@Input() minimumHeight!: number;

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
		const bounding: ClientRect = this.hostEl.getBoundingClientRect();
		this.elemPos.element = this.hostEl;
		this.elemPos.position = {
			top: this.hostEl.offsetTop,
			left: this.hostEl.offsetLeft,
			width: this.hostEl.offsetWidth,
			height: this.hostEl.offsetHeight
		};
		// get initial positions
		this.prevH = this.elemPos.position.height;
		this.prevW = this.elemPos.position.width;
		this.prevL = this.elemPos.position.left;
		this.prevT = this.elemPos.position.top;
	}

	// get rotation
	private getRotation(): number{
		const rotation: RegExpMatchArray|null = this.hostEl.style.transform.match(/rotate\((\d+)/);
		return rotation ? parseInt(rotation !== null ? rotation[1] : '0') : 0;
	}

	// relevant class touched
	private relevantClassTouched(target: HTMLElement): boolean {
		if( target.className.match(/rect/) && !this.hostEl.classList.contains('pinned') ){
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
				this.getStartParams(target.className);

				const whileMove = (e: TouchEvent|MouseEvent): void => {
					this.zone.runOutsideAngular(()=>{
						this.move(startMouse, e, target.className);
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

	// start params
	private getStartParams(className: string): void{
		this.rotation = this.getRotation();
		const theta: number = (Math.PI * 2 * this.rotation) / 360;
		const cos_t: number = Math.cos(theta);
		const sin_t: number = Math.sin(theta);

		const matrix: {a: 1|0, b: 1|0, c: 1|0, d: 1|0} = this.getResizeMatrix(className);
		this.resizeMatrix = matrix;

		const c0_x: number = this.elemPos.position.left + this.elemPos.position.width / 2.0;
		const c0_y: number = this.elemPos.position.top + this.elemPos.position.height / 2.0;

		const q0_x: number = this.elemPos.position.left + matrix.a * this.elemPos.position.width;
		const q0_y: number = this.elemPos.position.top + matrix.b * this.elemPos.position.height;

		const p0_x: number = this.elemPos.position.left + matrix.c * this.elemPos.position.width;
		const p0_y: number = this.elemPos.position.top + matrix.d * this.elemPos.position.height;

		this.qp0_x = q0_x * cos_t - q0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
		this.qp0_y = q0_x * sin_t + q0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y;
		this.pp_x = p0_x * cos_t - p0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
		this.pp_y = p0_x * sin_t + p0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y; 
	}

	// move event
	private move(startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, className: string): void{
		const delta: {x: number, y: number} = this.structure.getMouseDelta(startMouse, e);

		this.offset.scroller = this.getScrollPosition();

		const mtheta: number = (-1 * Math.PI * 2 * this.rotation) / 360;
		const cos_mt: number = Math.cos(mtheta);
		const sin_mt: number = Math.sin(mtheta);

		// weights of center scalars
		if(className.match(/center/)){
			if(className.match(/bottom|top/)){
				delta.x = delta.x * Math.round(Math.abs(sin_mt));
				delta.y = delta.y * Math.round(Math.abs(cos_mt));
			}else{
				delta.x = delta.x * Math.round(Math.abs(cos_mt));
				delta.y = delta.y * Math.round(Math.abs(sin_mt));
			}
		}

		const qp_x: number = this.structure.roundToGrid( this.qp0_x + delta.x );
		const qp_y: number = this.structure.roundToGrid( this.qp0_y + delta.y );

		const cp_x: number = (qp_x + this.pp_x) / 2.0;
		const cp_y: number = (qp_y + this.pp_y) / 2.0;

		let q_x: number = qp_x * cos_mt - qp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
		let q_y: number = qp_x * sin_mt + qp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

		let p_x: number = this.pp_x * cos_mt - this.pp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
		let p_y: number = this.pp_x * sin_mt + this.pp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

		const wtmp: number = this.resizeMatrix.a * (q_x - p_x) + this.resizeMatrix.c * (p_x - q_x);
		const htmp: number = this.resizeMatrix.b * (q_y - p_y) + this.resizeMatrix.d * (p_y - q_y);

		let w: number;
		let h: number;

		if (wtmp < this.minimumWidth || htmp < this.minimumHeight) {
			w = this.structure.roundToGrid(Math.max(this.minimumWidth, wtmp));
			h = this.structure.roundToGrid(Math.max(this.minimumHeight, htmp));

			const theta: number = -1 * mtheta;
			const cos_t: number = Math.cos(theta);
			const sin_t: number = Math.sin(theta);

			const dh_x: number = -sin_t * h;
			const dh_y: number = cos_t * h;

			const dw_x: number = cos_t * w;
			const dw_y: number = sin_t * w;

			const qp_x_min: number = this.pp_x + (this.resizeMatrix.a - this.resizeMatrix.c) * dw_x + (this.resizeMatrix.b - this.resizeMatrix.d) * dh_x;
			const qp_y_min: number = this.pp_y + (this.resizeMatrix.a - this.resizeMatrix.c) * dw_y + (this.resizeMatrix.b - this.resizeMatrix.d) * dh_y;

			const cp_x_min: number = (qp_x_min + this.pp_x) / 2.0;
			const cp_y_min: number = (qp_y_min + this.pp_y) / 2.0;

			q_x = this.structure.roundToGrid( qp_x_min * cos_mt - qp_y_min * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min );
			q_y = this.structure.roundToGrid( qp_x_min * sin_mt + qp_y_min * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min );

			p_x = this.structure.roundToGrid( this.pp_x * cos_mt - this.pp_y * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min );
			p_y = this.structure.roundToGrid( this.pp_x * sin_mt + this.pp_y * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min );
		}else{
			w = this.structure.roundToGrid(wtmp);
			h = this.structure.roundToGrid(htmp);
		}

		const l: number = this.resizeMatrix.c * q_x + this.resizeMatrix.a * p_x;
		const t: number = this.resizeMatrix.d * q_y + this.resizeMatrix.b * p_y;

		// set top/left
		if(this.elemPos.element){
			this.elemPos.element.style.top = t + 'px';
			this.elemPos.element.style.left = l + 'px';
			this.elemPos.element.style.width = w + 'px';
			this.elemPos.element.style.height = h + 'px';

			// check limits
			const bound: ClientRect = this.hostEl.getBoundingClientRect();
			const limitL: boolean = this.structure.roundToGrid(bound.left - this.offset.left) >= 0 ? true : false;
			const limitH: boolean = this.structure.roundToGrid(bound.top - this.offset.top + this.offset.scroller) >= 0 ? true : false;
			const limitW: boolean = this.structure.roundToGrid((bound.left + bound.width) - (window.innerWidth - this.offset.right)) <= 0 ? true : false;

			// limits
			if(limitL && limitH && limitW){
				this.prevL = l;
				this.prevT = t;
				this.prevH = h;
				this.prevW = w;
			}else{
				this.elemPos.element.style.top = this.prevT + 'px';
				this.elemPos.element.style.left = this.prevL + 'px';
				this.elemPos.element.style.width = this.prevW + 'px';
				this.elemPos.element.style.height = this.prevH + 'px';
			}
		}
	}

	// get resize matrix
	private getResizeMatrix(className: string): {a: 1|0, b: 1|0, c: 1|0, d: 1|0} {
		const a: 1 | 0 = className.match(/bottom-right|top-right|right-center|top-center/) ? 1 : 0;
		const b: 1 | 0 = className.match(/bottom-right|bottom-left|left-center|bottom-center/) ? 1 : 0;
		const c: 0 | 1 = a === 1 ? 0 : 1;
		const d: 0 | 1 = b === 1 ? 0 : 1;
		return {a, b, c, d}
	}

	ngOnDestroy(){
		this.eventHandler.removeHandle(this.handleID);
	}
}