import { Component, NgModule, HostListener, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Services
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

@Component({
	selector: 'menu-button-container',
	templateUrl: './menu-button-container.component.html',
	styleUrls: ['./menu-button-container.component.scss'],
})
export class MenuButtonContainerComponent {
	// Input for creation Menu
	// Component key input
	@Input() create!: string;
	// Show / hide buttons
	showUndo: boolean = false;

	constructor(
		private ref: ElementRef,
		public settings: SettingsService,
		public undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService) {
	}

	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target']) 
	onClick(target: HTMLElement) {
		if (!this.ref.nativeElement.contains(target) && this.showUndo) {
			this.showUndo = false;
		}
	}

	public saveChanges(): void {
		this.settings.modeSub.next({roomEdit: false, roomEditFrom: null});
		this.undoManager.applyChanges();
	}

	public cancelChanges(): void{
		this.undoManager.cancelChanges();
	}

	// create the room nenu
	createRoom(): void{
		this.componentLoader.createSingleComponent('CreateEditRoomComponent', this.componentLoader.containerStack[0].container, {type: 'create'});
	}
}
@NgModule({
	declarations: [ MenuButtonContainerComponent ],
	imports: [ IonicModule, CommonModule, CommonModule ],
	exports: [ MenuButtonContainerComponent ]
})
export class MenuButtonContainerModule {}