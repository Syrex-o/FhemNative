import { Directive, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { combineLatest, filter, first, fromEvent, map, merge, switchMap, timer } from 'rxjs';

import { TransformationManagerDirective } from '../transformationManager.directive';
import { ScaleManagerDirective } from '../scaleManager/scaleManager.directive';
import { MoveManagerDirective } from '../moveManager/moveManager.directive';

import { deltaMovedLimit, getMouseDelta, getMousePosition } from '@fhem-native/utils';
import { APP_CONFIG, AppConfig } from '@fhem-native/app-config';
import { ComponentTransformation } from '@fhem-native/types/components';

@Directive({
	selector: '[fhemNativeTransformationItem]'
})
export class TransformationItemDirective implements OnInit, OnChanges, OnDestroy{
    @Input('fhemNativeTransformationItem') id!: string;

	@Input() minDimensions!: {width: number, height: number};
	@Input() minDimensionsPercentage!: {width: number, height: number};

	// Events
	@Output() contextMenuClick = new EventEmitter<PointerEvent|Touch>();
	@Output() beginTransformation = new EventEmitter<ComponentTransformation>();
	@Output() endTransformation = new EventEmitter<ComponentTransformation>();

	// detemine if component is selected or not
	selected = false;

    // element references
    hostEl: HTMLElement;
	transformationRect!: HTMLElement|null;
	transformationHandle!: HTMLElement;

	// relevant position values
	position = {top: '0%', left: '0%', width: '0%', height: '0%'};
	initialPosition = {x: 0, y: 0};
	boundaries = { minX: 0, minY: 0, maxX: 0 };

	// child directives
	moveManager: MoveManagerDirective|undefined;
	scaleManager: ScaleManagerDirective|undefined;

	private readonly contextClickThreshold = 500;

    constructor(
        ref: ElementRef,
		private renderer: Renderer2,
		@Inject(DOCUMENT) private document: Document,
		@Inject(APP_CONFIG) private appConfig: AppConfig,
        private transformationManager: TransformationManagerDirective){
        this.hostEl = ref.nativeElement;
    }

    ngOnInit(): void {
        this.transformationManager.registerItem(this);
		this.getItemPosition();
    }

	registerMoveManager(moveManager: MoveManagerDirective): void{
		this.moveManager = moveManager;
		if(this.transformationRect) moveManager.createStartListener();
	}

	registerScaleManager(scaleManager: ScaleManagerDirective): void{
		this.scaleManager = scaleManager;
		if(this.transformationRect) scaleManager.createStartListener();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes['minDimensionsPercentage']) this.attatchMinDimensions();
	}

	private attatchMinDimensions(): void{
		if(this.transformationRect && this.minDimensionsPercentage){
			this.transformationRect.style.minWidth = this.minDimensionsPercentage.width + '%';
			this.transformationRect.style.minHeight = this.minDimensionsPercentage.height + '%';
		}
	}

	private getItemPosition(): void{
		this.position = {
			top: this.hostEl.style.top, left: this.hostEl.style.left,
			width: this.hostEl.style.width, height: this.hostEl.style.height
		}
	}

	prepareEvents(startEvent: MouseEvent|TouchEvent): void{
		// % initial position of component
		this.getItemPosition();
		this.initialPosition = getMousePosition(startEvent);
		// define boundaries
		this.boundaries = {
			minX: this.transformationManager.containerDimensions.left,
			minY: this.transformationManager.containerDimensions.top,
			maxX: this.transformationManager.containerDimensions.left + this.transformationManager.containerDimensions.width - this.hostEl.offsetWidth
		};
	}

    buildTransformationRect(): void{
        if(!this.transformationRect){
			const rectConf = '<span class="rect top-left"></span>' + '<span class="rect top-right"></span>'
				+ '<span class="rect bottom-left"></span>' + '<span class="rect bottom-right"></span>'
				+ '<span class="rect top-center"></span>' + '<span class="rect left-center"></span>'
				+ '<span class="rect right-center"></span>' + '<span class="rect bottom-center"></span>';

			this.transformationRect = this.renderer.createElement('div');
			this.renderer.addClass(this.transformationRect, 'fhemNative-moveable');

			if(this.transformationRect){
				this.transformationRect.style.top = this.hostEl.style.top;
				this.transformationRect.style.left = this.hostEl.style.left;
				this.transformationRect.style.width = this.hostEl.style.width;
				this.transformationRect.style.height = this.hostEl.style.height;
				this.transformationRect.style.zIndex = this.hostEl.style.zIndex;
			}

			// add transformation rect to main component container
			this.renderer.appendChild(this.transformationManager.container, this.transformationRect);
			this.renderer.setProperty(this.transformationRect, 'innerHTML', rectConf);

			// build move elem
			this.transformationHandle = this.renderer.createElement('span');
			this.renderer.addClass(this.transformationHandle, 'overlay-move');

			this.renderer.appendChild(this.transformationRect, this.transformationHandle);

			// attatch dimensions
			this.attatchMinDimensions();

			// attatch main listener
			this.attatchContextMenu();

			// create child listeners
			if(this.moveManager) this.moveManager.createStartListener();
			if(this.scaleManager) this.scaleManager.createStartListener();
		}
    }

	private attatchContextMenu(): void{
		if(this.transformationRect){
			// context menu trigger on desktop platforms
			if(this.appConfig.platform === 'desktop'){
				fromEvent<PointerEvent>(this.transformationRect, "contextmenu").subscribe((startEvent)=>{
					startEvent.preventDefault();
					this.contextMenuClick.emit(startEvent);
				});
			}else{
				// long press trigger on mobile platforms
				const touchEnd = fromEvent<TouchEvent>(this.transformationRect, 'touchend');
				fromEvent<TouchEvent>(this.transformationRect, 'touchstart').pipe(
					switchMap((start)=>{
						start.preventDefault();
						return merge(
							combineLatest([
								timer(this.contextClickThreshold),
								merge(
									timer(this.contextClickThreshold),
									fromEvent<TouchEvent>(this.document, 'touchmove').pipe(
										map(move=> {
											const delta = getMouseDelta(getMousePosition(start), move);
											return {delta, move};
										})
									)
								)
							]),
							touchEnd.pipe( map(()=> null) ),
						).pipe( 
							first(),
							map(x=> Array.isArray(x) ? ( x[1] || {delta: {x: 0, y: 0}, move: start}) : null )
						)
					}),
					map(x=> x && deltaMovedLimit(x.delta, 10) ? x.move : null),
					filter(x=> x !== null),
				).subscribe(x=> x ? this.contextMenuClick.emit(x.touches[0]) : null);
			}
		}
	}

    removeTransformationRect(): void{
		if(this.transformationRect){
			// delete moveable
			this.renderer.removeChild(this.hostEl, this.transformationRect);
			this.transformationRect = null;
			this.selected = false;
		}
	}
	
	updateZIndex(toValue: string): void{
		this.hostEl.style.zIndex = toValue;
		if(this.transformationRect) this.transformationRect.style.zIndex = toValue;
	}

    ngOnDestroy(): void {
        this.transformationManager.deleteItem(this);
		this.removeTransformationRect();
    }
}
