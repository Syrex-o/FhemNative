import { Directive, Output, EventEmitter, Inject, AfterViewInit, ElementRef, Input, NgZone } from '@angular/core';
import { fromEvent, merge, takeUntil } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TransformationManagerDirective } from '../transformationManager';

import { getMouseDelta, getMousePosition } from '@fhem-native/utils';

export interface MoveEvent {
	x: number,
	y: number
}

export interface WhileMoveEvent {
	start: MoveEvent,
	current: MoveEvent,
	delta: MoveEvent,
	// threshold triggered
	triggerEvent: boolean
}

@UntilDestroy()
@Directive({ 
	selector: '[fhemNativeMover]'
})
export class MoverDirective implements AfterViewInit{
	@Input() updateOnMove = false;
	@Input() threshold = 20;

	hostEl: HTMLElement;

	// event handlers
	dragEnd$ = merge( fromEvent<MouseEvent>(this.document, "mouseup"), fromEvent<TouchEvent>(this.document, "touchend") ).pipe( untilDestroyed(this) );
	drag$ = merge( fromEvent<MouseEvent>(this.document, "mousemove"), fromEvent<TouchEvent>(this.document, "touchmove") ).pipe( takeUntil(this.dragEnd$) );

	@Output() startMove = new EventEmitter<MoveEvent>();
	@Output() whileMove = new EventEmitter<WhileMoveEvent>();
	@Output() endMove = new EventEmitter<void>();

	constructor(
		ref: ElementRef,
		private zone: NgZone,
		@Inject(DOCUMENT) private document: Document,
		private transformationManager: TransformationManagerDirective){
		this.hostEl = ref.nativeElement;
	}

	ngAfterViewInit(): void {
		const dragStart$ = merge(
			fromEvent<MouseEvent>(this.hostEl, "mousedown"),
			fromEvent<TouchEvent>(this.hostEl, "touchstart")
		);

		dragStart$.subscribe((startEvent: MouseEvent|TouchEvent)=> {
			// block scrolling of container
			this.transformationManager.blockScroll();

			const startPos = getMousePosition(startEvent);
			this.startMove.emit( startPos );

			let throttle = 0;

			const dragSub = this.drag$.pipe().subscribe((dragEvent: MouseEvent|TouchEvent)=>{
				const currPos = getMousePosition(dragEvent);
				const deltaPos = getMouseDelta(startPos, currPos);
				
				throttle += 1;
				let thresholdTriggerEvent = false;

				if(throttle === this.threshold){
					thresholdTriggerEvent = true;
					throttle = 0;
				}

				this.zone.run(()=>{
					this.whileMove.emit({
						start: startPos, current: currPos, 
						delta: deltaPos, triggerEvent: thresholdTriggerEvent && this.updateOnMove
					});
				});
			});
		
			const dragEndSub = this.dragEnd$.subscribe(()=>{
				// allow scrolling after movement
				this.transformationManager.allowScroll();

				// remove listeners
				if(dragSub) dragSub.unsubscribe();
				if(dragEndSub) dragEndSub.unsubscribe();

				this.endMove.emit();
			});
		});
	}
}