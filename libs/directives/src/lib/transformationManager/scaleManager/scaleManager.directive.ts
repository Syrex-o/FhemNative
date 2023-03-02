import { Directive, OnInit } from '@angular/core';
import { fromEvent, merge } from 'rxjs';

import { TransformationManagerDirective } from '../transformationManager.directive';
import { TransformationItemDirective } from '../transformationItem/transformationItem.directive';

import { StructureService } from '@fhem-native/services';

import { decimalRounder, getMouseDelta } from '@fhem-native/utils';

@Directive({selector: '[fhemNativeScaleManager]'})
export class ScaleManagerDirective implements OnInit{
	constructor(
		private structure: StructureService,
		private transformationItem: TransformationItemDirective,
		private transformationManager: TransformationManagerDirective){
	}

	ngOnInit(): void {
		this.transformationItem.registerScaleManager(this);
	}

	createStartListener(): void{
		const relElements = this.transformationItem.transformationRect?.querySelectorAll('.rect');
		if(relElements){
			const dragStart$ = merge(
				fromEvent<MouseEvent>(relElements, "mousedown"),
				fromEvent<TouchEvent>(relElements, "touchstart")
			);

			const dragStartSub = dragStart$.subscribe((startEvent: MouseEvent|TouchEvent)=>{
				this.transformationItem.beginTransformation.emit({
					componentUID: this.transformationItem.id,
					containerUID: this.transformationManager.containerId,
					position: this.transformationItem.position
				});

				if(this.transformationItem.selected) this.transformationManager.triggerScaleManagers(startEvent);
			});
			this.transformationManager.addSubscriptions([dragStartSub]);
		}
	}

	move(startEvent: MouseEvent|TouchEvent, dragEvent: MouseEvent|TouchEvent): void{
		const delta = getMouseDelta(this.transformationItem.initialPosition, dragEvent);
		// apply grid snapping to delta
		delta.x = this.structure.snapToGridGrid(delta.x, this.transformationManager.containerDimensions.width * (this.structure.getGridDecimal() / 100) );
		delta.y = this.structure.snapToGridGrid(delta.y, this.transformationManager.containerDimensions.height * (this.structure.getGridDecimal() / 100) );

		// relevant class
		const className = (startEvent.target as HTMLElement).className;

		// base vals
		let top = this.transformationItem.transformationRect?.offsetTop || 0;
		let left = this.transformationItem.transformationRect?.offsetLeft || 0;
		let width = this.transformationItem.transformationRect?.offsetWidth || 0;
		let height = this.transformationItem.transformationRect?.offsetHeight || 0;

		if(className.match(/top/)){
			top = this.structure.snapToGridGrid(this.transformationItem.hostEl.offsetTop + delta.y, this.transformationManager.containerDimensions.height * (this.structure.getGridDecimal() / 100) );
			height = this.transformationItem.hostEl.offsetHeight - delta.y;
		}
		if(className.match(/right/)){
			width = this.transformationItem.hostEl.offsetWidth + delta.x;
		}
		if(className.match(/left/)){
			left = this.structure.snapToGridGrid(this.transformationItem.hostEl.offsetLeft + delta.x, this.transformationManager.containerDimensions.width * (this.structure.getGridDecimal() / 100) );
			width = this.transformationItem.hostEl.offsetWidth - delta.x;
		}
		if(className.match(/bottom/)){
			height = this.transformationItem.hostEl.offsetHeight + delta.y;
		}

		if(this.transformationItem.transformationRect){
			// check for boundaries
			if(top < this.transformationItem.boundaries.minY){
				top = this.transformationItem.boundaries.minY;
				height = this.transformationItem.transformationRect.offsetHeight;
			}
			if(left < this.transformationItem.boundaries.minX){
				left = this.transformationItem.boundaries.minX;
				width = this.transformationItem.transformationRect.offsetWidth;
			}

			if(height < this.transformationItem.minDimensions.height){
				top = this.transformationItem.transformationRect.offsetTop;
				height = this.transformationItem.transformationRect.offsetHeight;
			}

			if(width < this.transformationItem.minDimensions.width){
				left = this.transformationItem.transformationRect.offsetLeft;
				width = this.transformationItem.transformationRect.offsetWidth;
			}
			if( width + left > this.transformationManager.containerDimensions.width ){
				width = this.transformationManager.containerDimensions.width - left;
			}

			this.transformationItem.position.top = decimalRounder(( top / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
			this.transformationItem.position.left = decimalRounder(( left / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
			this.transformationItem.position.width = decimalRounder(( width / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
			this.transformationItem.position.height = decimalRounder(( height / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
			
			this.transformationItem.transformationRect.style.top = this.transformationItem.position.top;
			this.transformationItem.transformationRect.style.left = this.transformationItem.position.left;
			this.transformationItem.transformationRect.style.width = this.transformationItem.position.width;
			this.transformationItem.transformationRect.style.height = this.transformationItem.position.height;
		}
	}

	end(): void{
		this.transformationManager.applyPositionChange(this.transformationItem.hostEl, this.transformationItem.position);

		this.transformationItem.endTransformation.emit({
			componentUID: this.transformationItem.id,
			containerUID: this.transformationManager.containerId,
			position: this.transformationItem.position
		});
	}
}
