import { Directive, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { fromEvent, merge, Subscription, takeUntil } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TransformationItemDirective } from './transformationItem/transformationItem.directive';

import { ComponentTransformation, EditMode } from '@fhem-native/types/components';

@UntilDestroy()
@Directive({
	selector: '[fhemNativeTransformationManager]'
})
export class TransformationManagerDirective implements OnChanges, OnDestroy{
	@Input() editMode: EditMode|undefined;
	@Input('fhemNativeTransformationManager') containerId!: string;

	// Events
	@Output() beginTransformationAny: EventEmitter<ComponentTransformation[]> = new EventEmitter<ComponentTransformation[]>();
	@Output() endTransformationAny: EventEmitter<ComponentTransformation[]> = new EventEmitter<ComponentTransformation[]>();

	// component container reference
	container: HTMLElement;
	containerDimensions = { top: 0, left: 0, width: 0, height: 0};

	// transformation items
	transformationItems = new Map<string, TransformationItemDirective>();

	// event sub list
	private subscriptions: Subscription[] = [];

	// evnet handlers
	dragEnd$ = merge( fromEvent<MouseEvent>(this.document, "mouseup"), fromEvent<TouchEvent>(this.document, "touchend") ).pipe( untilDestroyed(this) );
	drag$ = merge( fromEvent<MouseEvent>(this.document, "mousemove"), fromEvent<TouchEvent>(this.document, "touchmove") ).pipe( takeUntil(this.dragEnd$) );

	constructor(ref: ElementRef, @Inject(DOCUMENT) private document: Document){
		this.container = ref.nativeElement;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(!changes['editMode']) return;

		if(this.modeCheck(changes['editMode'].currentValue)) return this.buildTransformationRects();
		this.removeTransformationRects();
	}

	// check editor mode, when new component is registered
	private modeCheck(mode: EditMode): boolean{
		return mode.editComponents && mode.editFrom === this.containerId;
	}

	private updateContainerDimensions(){
		this.containerDimensions.top = this.container.offsetTop;
		this.containerDimensions.left = this.container.offsetLeft;
		this.containerDimensions.width = this.container.offsetWidth;
		this.containerDimensions.height = this.container.offsetHeight;
	}

	// register transformation item
	registerItem(transformationItem: TransformationItemDirective): void{
		this.transformationItems.set(transformationItem.id, transformationItem);
		// on component creation, check for edit mode --> create moveRect
		if(this.editMode && this.modeCheck(this.editMode)) transformationItem.buildTransformationRect();
	}

	// get single transformation item from list
	getItem(itemId: string): TransformationItemDirective|undefined{
		return this.transformationItems.get(itemId);
	}

	// remove transformation item
	deleteItem(transformationItem: TransformationItemDirective): void{
		this.transformationItems.delete(transformationItem.id);
	}

	// add move rect to items
	private buildTransformationRects(): void{
		this.transformationItems.forEach(section=> section.buildTransformationRect());
	}

	// remove move rect from items
	private removeTransformationRects(): void{
		this.transformationItems.forEach(section=> section.removeTransformationRect());
		this.removeSubscriptions();
	}

	private getTransformationProperties(): ComponentTransformation[]{
		return Array.from(this.transformationItems).map( ([key, item]) => ({
			componentUID: item.id,
			containerUID: this.containerId,
			position: item.position
		}) );
	}

	private startTransformations(startEvent: MouseEvent|TouchEvent): void{
		this.beginTransformationAny.emit( this.getTransformationProperties() );

		// current dimensions on start move trigger
		this.updateContainerDimensions();
		// block scrolling of container
		this.container.style.overflowY = 'hidden';
		// get initial values
		this.transformationItems.forEach((item)=> item.prepareEvents(startEvent) );
	}

	endTransformations(): void{
		// allow scrolling
		this.container.style.overflowY = 'auto';
		this.endTransformationAny.emit( this.getTransformationProperties() );
	}

	private triggerHandler(startEvent: MouseEvent|TouchEvent, dragCallback: (dragEvent: MouseEvent|TouchEvent )=>void, grabEndCallback: ()=> void): void{
		this.startTransformations(startEvent);

		const dragSub = this.drag$.subscribe((dragEvent: MouseEvent|TouchEvent) => {
			dragEvent.preventDefault();
			dragCallback(dragEvent);
		});

		const dragEndSub = this.dragEnd$.subscribe(()=>{
			grabEndCallback();
			this.endTransformations();

			if(dragSub) dragSub.unsubscribe();
			if(dragEndSub) dragEndSub.unsubscribe();
		});
	}

	// one moveManager triggers movement of multiple --> multiple selected
	triggerMoveManagers(startEvent: MouseEvent|TouchEvent): void{
		this.triggerHandler(
			startEvent,
			(dragEvent)=> this.transformationItems.forEach(item=> item.selected ? item.moveManager?.move(startEvent, dragEvent) : null),
			()=> this.transformationItems.forEach(item=> item.selected ? item.moveManager?.end() : null)
		);
	}

	// one scaleManager triggers movement of multiple --> multiple selected
	triggerScaleManagers(startEvent: MouseEvent|TouchEvent): void{
		this.triggerHandler(
			startEvent,
			(dragEvent)=> this.transformationItems.forEach(item=> item.selected ? item.scaleManager?.move(startEvent, dragEvent) : null),
			()=> this.transformationItems.forEach(item=> item.selected ? item.scaleManager?.end() : null)
		);
	}

	addSubscriptions(subs: Subscription[]): void{
		this.subscriptions.push(...subs);
	}

	/**
	 * Apply style of transformation directly to component instance
	 * @param containerComponent Reference to dynamic container component
	 * @param position position keys of interface ComponentPosition
	 */
	applyPositionChange(elem: HTMLElement, position: {[key: string]: string}): void{
		for( const [key, value] of Object.entries(position)){
			elem.style[ key as 'top'|'left'|'width'|'height' ] = value;
		}
	}

	private removeSubscriptions(): void{
		this.subscriptions.forEach((s) => s?.unsubscribe());
	}

	ngOnDestroy(): void {
		this.removeTransformationRects();
	}
}
