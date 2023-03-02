import { Directive, OnInit } from '@angular/core';
import { fromEvent, merge } from 'rxjs';

import { TransformationManagerDirective } from '../transformationManager.directive';
import { TransformationItemDirective } from '../transformationItem/transformationItem.directive';

import { StructureService } from '@fhem-native/services';

import { decimalRounder, getMouseDelta } from '@fhem-native/utils';

@Directive({selector: '[fhemNativeMoveManager]'})
export class MoveManagerDirective implements OnInit{
	constructor(
		private structure: StructureService,
		private transformationItem: TransformationItemDirective,
		private transformationManager: TransformationManagerDirective){
	}

	ngOnInit(): void {
		this.transformationItem.registerMoveManager(this);
	}

	createStartListener(): void{
		const dragStart$ = merge(
			fromEvent<MouseEvent>(this.transformationItem.transformationHandle, "mousedown"),
			fromEvent<TouchEvent>(this.transformationItem.transformationHandle, "touchstart")
		);
		
		const dragStartSub = dragStart$.subscribe((startEvent: MouseEvent|TouchEvent)=> {
			this.transformationItem.beginTransformation.emit({
				componentUID: this.transformationItem.id,
				containerUID: this.transformationManager.containerId,
				position: this.transformationItem.position
			});
			
			if(this.transformationItem.selected) this.transformationManager.triggerMoveManagers(startEvent);
		} );
		this.transformationManager.addSubscriptions([dragStartSub]);
	}

	move(startEvent: MouseEvent|TouchEvent, dragEvent: MouseEvent|TouchEvent): void{
		if(this.transformationItem.transformationRect){
			const delta = getMouseDelta(this.transformationItem.initialPosition, dragEvent);

			let top = this.transformationItem.hostEl.offsetTop + delta.y;
			let left = this.transformationItem.hostEl.offsetLeft + delta.x;

			top = Math.max(this.transformationItem.boundaries.minY, top);
			left = Math.max(this.transformationItem.boundaries.minX, Math.min(left, this.transformationItem.boundaries.maxX));

			this.transformationItem.position.top = decimalRounder(( top / this.transformationManager.containerDimensions.height ) * 100, this.structure.getGridDecimal()) + '%';
			this.transformationItem.position.left = decimalRounder(( left / this.transformationManager.containerDimensions.width ) * 100, this.structure.getGridDecimal()) + '%';
			
			this.transformationItem.transformationRect.style.top = this.transformationItem.position.top;
			this.transformationItem.transformationRect.style.left = this.transformationItem.position.left;
		}
	}

	end(): void{
		this.transformationManager.applyPositionChange(this.transformationItem.hostEl, {
			top: this.transformationItem.position.top,
			left: this.transformationItem.position.left
		});

		this.transformationItem.endTransformation.emit({
			componentUID: this.transformationItem.id,
			containerUID: this.transformationManager.containerId,
			position: this.transformationItem.position
		});
	}
}
