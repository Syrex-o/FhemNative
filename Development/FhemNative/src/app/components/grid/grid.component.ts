import { Component, NgModule, ViewChild, ElementRef, OnInit, OnDestroy, HostListener, Input } from '@angular/core';

// Components
import { ComponentsModule } from '../components.module';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { ComponentLoaderService } from '../../services/component-loader.service';
import { SelectComponentService } from '../../services/select-component.service';
import { HotKeyService } from '../../services/hotkey.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
  	selector: 'grid',
  	templateUrl: './grid.component.html',
  	styleUrls: ['./grid.component.scss']
})
export default class GridComponent implements OnInit, OnDestroy {
	// input of the container, where grid is created
	@Input() container: any;

	// grid properties
	gridW: Array<number>;
  	gridH: Array<number>;
  	// Grid Height
  	gridHeight = 0;

	// shift press
	private shiftPress: boolean = false;

  	constructor(
		private settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService,
		private selectComponent: SelectComponentService,
		private hotKey: HotKeyService,
		private undoManager: UndoRedoService) {
	}

	@HostListener('touchstart', ['$event'])
	@HostListener('mousedown', ['$event'])
	onMouseDown(e) {
		if(this.shiftPress){
			this.componentLoader.createSingleComponent('SelectRectangleComponent', this.componentLoader.containerStack[0].container, {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
				container: this.container
			});
		}
	}

	// remove selection rect
	private removeSelectRect(){
		this.componentLoader.removeDynamicComponent('SelectRectangleComponent');
	}

	ngOnInit() {
		// initially build grid
		this.buildGrid();
		// subscribe to component resize and move changes
		this.selectComponent.addHandle('ALL_GRID', 'move', (dimensions)=>{
			this.buildGrid();
		});
		this.selectComponent.addHandle('ALL_GRID', 'resize', (dimensions)=>{
			this.buildGrid();
		});

		// build shift shortcut
		this.hotKey.add('GRIDdown' , 'shift', (ID: string)=>{
			this.shiftPress = true;
		}, 'keydown');
		this.hotKey.add('GRIDup', 'shift', (ID: string)=>{
			this.shiftPress = false;
			this.removeSelectRect();
		}, 'keyup');

		// create shortcuts
		// select all
		this.hotKey.add('GRID_CONTROL_A', 'mod+a', (ID: string)=>{
			if(!this.selectComponent.evalCopySelectorAll(this.container)){
				// not all components selected
				this.selectComponent.buildCopySelectorAll(this.container);
			}else{
				// all components are selected
				this.selectComponent.removeContainerCopySelector(this.container, true);
			}
		});
		// copy selection
		this.hotKey.add('GRID_CONTROL_C', 'mod+c', (ID: string)=>{
			if(this.selectComponent.selectorList.length > 0){
				this.selectComponent.copyComponent('', this.container);
			}
		}, 'keydown');
		// paste selection
		this.hotKey.add('GRID_CONTROL_V', 'mod+v', (ID: string)=>{
			if(this.selectComponent.copyList.length > 0){
				this.selectComponent.pasteComponent(this.container);
				// save config
				this.saveComp();
				this.selectComponent.removeContainerCopySelector(this.container, true);
			}
		}, 'keydown');
		// delete selection
		this.hotKey.add('GRID_CONTROL_D', 'mod+d', (ID: string)=>{
			if(this.selectComponent.selectorList.length > 0){
				this.selectComponent.removeComponent('');
				// save config
				this.saveComp();
			}
		}, 'keydown');
		// undo 
		this.hotKey.add('GRID_CONTROL_Z', 'mod+z', (ID: string)=>{
			this.undoManager.undoChange();
		}, 'keydown');
		// redo
		this.hotKey.add('GRID_CONTROL_Y', 'mod+y', (ID: string)=>{
			this.undoManager.redoChange();
		}, 'keydown');
	}

	// deselect all components
	deselectComponents(){
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
	}

	// create context menu
	createContextMenu(e){
		// component is created in room --> base level container in stack
		this.componentLoader.createSingleComponent('ContextMenuComponent', this.componentLoader.containerStack[0].container, {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
			source: 'grid',
			container: this.container
		});
	}

	private buildGrid(){
		const parent: HTMLElement = this.container.element.nativeElement.parentNode;
		const parentW = parent.clientWidth;
		const parentH = parent.scrollHeight;
		//  reset values
		this.gridHeight = parentH;
		this.gridW = [];
	  	this.gridH = [];
	  	const WS = Math.floor(parentW / this.settings.app.grid.gridSize);
	  	const HS = Math.floor(parentH / this.settings.app.grid.gridSize);
	  	for (let i = 1; i <= WS; i++) {
		    this.gridW.push(this.settings.app.grid.gridSize * i);
		}
		for (let i = 1; i <= HS; i++) {
			this.gridH.push(this.settings.app.grid.gridSize * i);
		}
	}

	// refers to same logic as edit component
	private saveComp(){
		// add to change stack
		this.undoManager.addChange();
	}

	ngOnDestroy(){
		this.selectComponent.removeHandle('ALL_GRID', 'move');
		this.selectComponent.removeHandle('ALL_GRID', 'resize');
		// remove hotkeys
		this.hotKey.remove('GRIDdown');
		this.hotKey.remove('GRIDup');
		this.hotKey.remove('GRID_CONTROL_A');
		this.hotKey.remove('GRID_CONTROL_C');
		this.hotKey.remove('GRID_CONTROL_V');
		this.hotKey.remove('GRID_CONTROL_D');
		this.hotKey.remove('GRID_CONTROL_Z');
		this.hotKey.remove('GRID_CONTROL_Y');

		// remove rect
		this.removeSelectRect();
	}
}

@NgModule({
	imports: [ComponentsModule],
  	declarations: [GridComponent]
})
class GridComponentModule {}