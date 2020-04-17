import { Component, HostListener, ElementRef, Input } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'menu-button-container',
	templateUrl: './menu-button-container.component.html',
  	styleUrls: ['./menu-button-container.component.scss'],
})
export class MenuButtonContainerComponent {
	// Input for creation Menu
	// Component key input
	@Input() create: string;
	// Show / hide buttons
	public showUndo: boolean = false;

	constructor(
		public settings: SettingsService,
		public undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService,
		private ref: ElementRef) {
	}

	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target']) 
	onClick(target) {
    	if (!this.ref.nativeElement.contains(target) && this.showUndo) {
      		this.showUndo = false;
    	}
  	}

  	public saveChanges() {
  		this.settings.modeSub.next({
			roomEdit: false,
			roomEditFrom: null
		});
		this.undoManager.applyChanges();
  	}

  	public cancelChanges(){
  		this.settings.modeSub.next({
			roomEdit: false,
			roomEditFrom: null
		});
		this.undoManager.cancelChanges();
  	}

  	// create the room nenu
  	createRoom(){
  		this.componentLoader.createSingleComponent('CreateEditRoomComponent', this.componentLoader.containerStack[0].container, {
			type: 'create'
		});
  	}
}