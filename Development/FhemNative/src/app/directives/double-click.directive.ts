import { Directive, Input, ElementRef, HostBinding, HostListener, EventEmitter, Output } from '@angular/core';

import { CreateComponentService } from '../services/create-component.service';
import { HelperService } from '../services/helper.service';

@Directive({ selector: '[double-click]' })
export class DoubleClick {
	private clicker = 0;
	private doubleClicked: boolean;

	@Input() editingEnabled = false;
	// used to identify source
	// default double click comes from component
	// other double click users must define a different source
	@Input() source = 'component';

	// Custom Handler for events
	@Output() onDoubleClick = new EventEmitter();

	@HostBinding('class.double-click') get doubleClick() { return this.doubleClicked; }

	@HostListener('click', ['$event'])
  	onDblClick(e) {
  		if (this.editingEnabled && (e.target.className === 'overlay-move' || e.target.className === 'grid')) {
  			this.clicker ++;
  			setTimeout(() => {
		  		if (this.clicker >= 2) {
		  			this.doubleClicked = true;
		  			// double click detected on component
		  			if (this.source === 'component') {
		  				this.createComponent.createSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer, {
							x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
							y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
							source: this.source,
							componentID: this.ref.nativeElement.id,
							container: this.helper.find(this.createComponent.containerComponents, 'ID', this.ref.nativeElement.id).item.container
						});
		  			} else {
		  				this.onDoubleClick.emit(e);
		  			}
		  			// removing double click class
		  			setTimeout(() => {
		  				this.doubleClicked = false;
		  			}, 500);
		  		}
		  		this.clicker = 0;
		  	}, 250);
  		}
  	}

	constructor(
		private createComponent: CreateComponentService,
		private ref: ElementRef,
		private helper: HelperService) {

	}
}
