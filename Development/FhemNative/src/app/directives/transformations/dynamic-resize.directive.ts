import { Directive, Input, ElementRef, OnInit, HostListener } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { SelectComponentService } from '../../services/select-component.service';

// Interfaces
import { ElementPosition, ElementPositionString, DynamicComponentDefinition } from '../../interfaces/interfaces.type';

@Directive({ selector: '[dynamic-resize]' })
export class DynamicResizeDirective implements OnInit {
	// reference to the element
	private hostEl: HTMLElement;
	private transformationTimeout: any;

	// component info
	@Input() minimumWidth: number;
	@Input() minimumHeight: number;

	constructor(
		private settings: SettingsService, 
		private structure: StructureService,
		private selectComponent: SelectComponentService,
		private ref: ElementRef){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	// resize handler
	@HostListener('window:resize')
	onDeviceRotation(){
		setTimeout(()=>{
			this.resizeElemFromWindow();
		}, 100);
	}

	ngOnInit(){
		setTimeout(()=>{
			this.resizeElemFromWindow();
		}, 100);
	}

	private resizeElemFromWindow(): void {
		if (this.settings.app.responsiveResize) {
			// get relevant component
			const component: DynamicComponentDefinition|null = this.structure.getComponent(this.hostEl.id);
			if(component){
				let scaler: {width: number, height: number};
				if (component.createScaler){
					scaler = component.createScaler;
				}else{
					// create initial scaler
					scaler = {width: window.innerWidth, height: window.innerHeight};
					component.createScaler = scaler;
					this.structure.saveRooms();
				}
				// check component for different create scaler
				if (window.innerWidth !== scaler.width || window.innerHeight !== scaler.height) {
					// current position
					const current: ElementPosition = {
						top: parseInt(component.position.top),
						left: parseInt(component.position.left),
						width: parseInt(component.position.width),
						height: parseInt(component.position.height)
					};
					// determine new component position based on scaler
					let newComponentPosition: ElementPositionString = {
						top: component.position.top,
						left: component.position.left,
						width: component.position.width,
						height: component.position.height
					};
					// get scales
					const scaleW: number = current.width / scaler.width;
					const scaleL: number = current.left / scaler.width;

					// new width
					let newWidth: number = Math.round(this.structure.roundToGrid( window.innerWidth * scaleW ));
					newWidth = newWidth >= this.minimumWidth ? newWidth : this.minimumWidth;
					if(newWidth !== current.width){
						newComponentPosition.width = newWidth + 'px';
					}
					
					// new height
					const scaleHeightFactor: number = newWidth / current.width;
					let newHeight: number = Math.round(this.structure.roundToGrid( current.height * scaleHeightFactor ));
					newHeight = newHeight >= this.minimumHeight ? newHeight : this.minimumHeight;
					if(newHeight !== current.height){
						newComponentPosition.height = newHeight + 'px';
					}

					// new top
					let newTop: number = Math.round(this.structure.roundToGrid( current.top * scaleHeightFactor ));
					newTop = newTop >= 0 ? newTop : 0;
					if(newTop !== current.top){
						newComponentPosition.top = newTop + 'px';
					}

					// new left
					let newLeft: number = Math.round(this.structure.roundToGrid( window.innerWidth * scaleL ));
					newLeft = newLeft <= 0 ? 0 : newLeft;
					if(newLeft !== current.left){
						newComponentPosition.left = newLeft + 'px';
					}
					this.dynamicComponentTransformer(component, newComponentPosition);
				}
			}
		}
	}

	// dynamic component transformation --> including transition
	public dynamicComponentTransformer(component: DynamicComponentDefinition, positions: ElementPositionString): void{
		if(this.transformationTimeout) clearTimeout(this.transformationTimeout);
		this.transformationTimeout = setTimeout(()=>{
			// add transition style
			this.hostEl.style.transition = 'all .3s ease';
			// assign values
			for(const [key, value] of Object.entries(positions)){
				this.hostEl.style[key] = value;
			}
			// assign new create scaler
			component.createScaler = {width: window.innerWidth, height: window.innerHeight};
			// save values
			this.structure.saveItemPosition({
				item: component.position,
				dimensions: positions
			}, true);

			// reset style attr
			const timeout = setTimeout(() => {
				this.hostEl.style.transition = 'all 0ms linear';

				// check if element is still in view
				if(this.hostEl.parentElement.parentElement.parentElement){
					// get offsets
					const res: {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} = this.structure.getOffsets(this.hostEl);
					const pos: ElementPosition = {
						top: parseInt(positions.top) - res.offsets.top,
						left: parseInt(positions.left) - res.offsets.left,
						width: parseInt(positions.width),
						height: parseInt(positions.height)
					}
					// event trigger for size changes
					this.selectComponent.handles.next({ID: this.hostEl.id, forHandle: 'whileResize', dimensions: pos});
					this.selectComponent.handles.next({ID: this.hostEl.id, forHandle: 'resize', dimensions: pos});
				}
			}, 300);
		}, 300);
	}
}