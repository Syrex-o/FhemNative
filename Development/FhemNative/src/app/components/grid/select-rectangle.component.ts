import { Component, Input, HostListener, OnInit } from '@angular/core';

import { CreateComponentService } from '../../services/create-component.service';
import { SelectComponentService } from '../../services/select-component.service';
import { StructureService } from '../../services/structure.service';

@Component({
	selector: 'select-rectangle',
	template: `
		<div
			class="select-rect"
			[ngStyle]="selectStyle">
		</div>
	`,
	styles: [`
		.select-rect{
			display: block;
			position: absolute;
			background: rgba(20, 169, 213, 0.3);
			border: 2px solid var(--btn-blue);
			z-index: 100;
		}
	`]
})

export class SelectRectangleComponent implements OnInit {
	// key to find comp
	static key = 'SelectRectangleComponent';

	private press: boolean = true;

	@Input() x: number;
	@Input() y: number;

	@Input() container: any;

	selectStyle: any = {
		top: 0,
		left: 0,
		width: 0,
		height: 0
	};

	private selectVals:any;

	constructor(
		private createComponent: CreateComponentService,
		private selectComponent: SelectComponentService,
		private structure: StructureService){
	}

	ngOnInit(){
		this.selectStyle.top = `${this.y - 56 + this.evaluateScroller()}px`;
		this.selectStyle.left = `${this.x}px`;
	}

	@HostListener('document:mousemove', ['$event'])
	whilePress(e) {
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: (e.pageY || (e.touches ? e.touches[0].clientY : 0)) - 56 + this.evaluateScroller()
		};

		this.selectVals = {
			x1: Math.min(this.x,d.x),
			x2: Math.max(this.x,d.x),
			y1: Math.min(this.y - 56 + this.evaluateScroller(),d.y),
			y2: Math.max(this.y - 56 + this.evaluateScroller(),d.y)
		};

		this.selectStyle = {
			left: `${this.selectVals.x1}px`,
			top: `${this.selectVals.y1}px`,
			width: `${this.selectVals.x2 - this.selectVals.x1}px`,
			height: `${this.selectVals.y2 - this.selectVals.y1}px`
		};
	}

	@HostListener('document:mouseup')
	endPress() {
		// remove select rect
		this.createComponent.removeSingleComponent('SelectRectangleComponent', this.container);
		// select relevant items
		this.selectComponent.removeContainerCopySelector(false, true);
		// get room components
		const roomComponents = this.structure.getComponentContainer(this.container);

		roomComponents.forEach((comp)=>{
			const pos = {
				top: parseInt(comp.position.top),
				left: parseInt(comp.position.left),
				width: parseInt(comp.position.width),
				height: parseInt(comp.position.height),
			}

			if(pos.left > this.selectVals.x1 && pos.left + pos.width < this.selectVals.x2 && pos.top > this.selectVals.y1 && pos.top + pos.height < this.selectVals.y2) {
				this.selectComponent.buildCopySelector(comp.ID, false, this.container);
			}
		});
	}

	private evaluateScroller() {
  		return this.container.element.nativeElement.parentNode.scrollTop;
  	}
}