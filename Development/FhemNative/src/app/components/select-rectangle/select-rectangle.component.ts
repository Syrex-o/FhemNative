import { Component, NgModule, Input, HostListener, OnInit } from '@angular/core';

// Components
import { ComponentsModule } from '../components.module';

// Services
import { StructureService } from '../../services/structure.service';
import { SelectComponentService } from '../../services/select-component.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

@Component({
	selector: 'select-rectangle',
	templateUrl: './select-rectangle.component.html',
  	styleUrls: ['./select-rectangle.component.scss']
})
export default class SelectRectangleComponent implements OnInit {
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
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService,
		private structure: StructureService){
	}

	@HostListener('document:mousemove', ['$event'])
	whilePress(e) {
		const d = {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: (e.pageY || (e.touches ? e.touches[0].clientY : 0)) - 56 + this.scrollPosition()
		};
		this.selectVals = {
			x1: Math.min(this.x,d.x),
			x2: Math.max(this.x,d.x),
			y1: Math.min(this.y - 56 + this.scrollPosition(),d.y),
			y2: Math.max(this.y - 56 + this.scrollPosition(),d.y)
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
		this.componentLoader.removeDynamicComponent('SelectRectangleComponent');
		// select relevant items
		this.selectComponent.removeContainerCopySelector(this.container, true);
		// get room components
		if(this.selectVals){
			const roomComponents = this.structure.getComponentContainer(this.container);
			roomComponents.forEach((comp)=>{
				const pos = {
					top: parseInt(comp.position.top),
					left: parseInt(comp.position.left),
					width: parseInt(comp.position.width),
					height: parseInt(comp.position.height)
				}
				if(pos.left > this.selectVals.x1 && pos.left + pos.width < this.selectVals.x2 && pos.top > this.selectVals.y1 && pos.top + pos.height < this.selectVals.y2) {
					this.selectComponent.buildCopySelector(comp.ID, false);
				}
			});
		}
	}

	ngOnInit(){
		this.selectStyle.top = `${this.y - 56 + this.scrollPosition()}px`;
		this.selectStyle.left = `${this.x}px`;
	}

	// evaluate the scroll position
	private scrollPosition(){
		return this.container.element.nativeElement.parentNode.scrollTop;
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [SelectRectangleComponent]
})
class SelectRectangleComponentModule {}