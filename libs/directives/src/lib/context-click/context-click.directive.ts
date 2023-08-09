import { Directive, Output, EventEmitter, ElementRef, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription, combineLatest, filter, first, fromEvent, map, merge, switchMap, timer } from 'rxjs';

import { APP_CONFIG, AppConfig } from '@fhem-native/app-config';
import { deltaMovedLimit, getMouseDelta, getMousePosition } from '@fhem-native/utils';

// Long press / context menu click directive
// used to bypass bug on ios (context click not triggered)
@Directive({ selector: '[fhemNativeContextClick]' })
export class ContextClickDirective implements OnDestroy{
	private eventSub!: Subscription;
	private readonly threshold = 500;

	@Output() contextClick = new EventEmitter<Event|Touch>();

	constructor(
		private elementRef: ElementRef, 
		@Inject(DOCUMENT) private document: Document,
		@Inject(APP_CONFIG) private appConfig: AppConfig) {
		// context menu trigger on desktop platforms
		if(appConfig.platform === 'desktop'){
			fromEvent<TouchEvent|MouseEvent>(elementRef.nativeElement, "contextmenu").subscribe((startEvent)=>{
				startEvent.preventDefault();
				this.contextClick.emit(startEvent);
			});
		}else{
			// long press trigger on mobile platforms
			const touchEnd = fromEvent<TouchEvent>(elementRef.nativeElement, 'touchend');
			this.eventSub = fromEvent<TouchEvent>(elementRef.nativeElement, 'touchstart').pipe(
				switchMap((start)=>{
					start.preventDefault();
					return merge(
						combineLatest([
							timer(this.threshold),
							merge(
								timer(this.threshold),
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
			).subscribe(x=> x ? this.contextClick.emit(x.touches[0]) : null);
		}
	}

	ngOnDestroy(): void {
		if(this.eventSub) this.eventSub.unsubscribe();
	}
}