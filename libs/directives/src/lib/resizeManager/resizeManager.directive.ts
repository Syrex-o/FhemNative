import { Directive, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

export class ResizedEvent {
	public newRect: DOMRectReadOnly;
	public oldRect?: DOMRectReadOnly;
	public isFirst: boolean;

	public constructor(newRect: DOMRectReadOnly, oldRect: DOMRectReadOnly | undefined) {
		this.newRect = newRect;
		this.oldRect = oldRect;
		this.isFirst = oldRect == null;
	}
}

@Directive({
	selector: '[fhemNativeResizeManager]'
})
export class ResizeManagerDirective implements OnInit, OnDestroy {
	private observer: ResizeObserver;
	private oldRect?: DOMRectReadOnly;
	private timeout: ReturnType<typeof setTimeout>|undefined;

	@Output() public readonly resized;

	public constructor(
		private readonly element: ElementRef,
		private readonly zone: NgZone){
		this.resized = new EventEmitter<ResizedEvent>();
		this.observer = new ResizeObserver(entries => this.zone.run(() => {
			if(this.timeout) clearTimeout(this.timeout);
			this.timeout = setTimeout(()=> this.observe(entries), 100);
		}));
	}

	public ngOnInit(): void {
		this.observer.observe(this.element.nativeElement)
	}

	private observe(entries: ResizeObserverEntry[]): void {
		const domSize = entries[0];
		const resizedEvent = new ResizedEvent(domSize.contentRect, this.oldRect);
		this.oldRect = domSize.contentRect;
		this.resized.emit(resizedEvent);
	}

	public ngOnDestroy(): void {
		this.observer.disconnect();
	}
}
