import { Component, NgModule, ViewChild, ElementRef, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// directives
import { ClickerModule } from '../../directives/clicker.directive';

// Services
import { HotKeyService } from '@FhemNative/services/hotkey.service';
import { SettingsService } from '@FhemNative/services/settings.service';
import { UndoRedoService } from '@FhemNative/services/undo-redo.service';
import { StructureService } from '@FhemNative/services/structure.service';
import { SelectComponentService } from '@FhemNative/services/select-component.service';
import { ComponentLoaderService } from '@FhemNative/services/component-loader.service';

@Component({
	selector: 'grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent implements OnInit, OnDestroy {
	// input of the container, where grid is created
	@Input() container: any;

	// grid properties
	gridW: Array<number> = [];
	gridH: Array<number> = [];
	// Grid Height
	gridHeight = 0;

	constructor(
		private ref: ElementRef,
		private hotKey: HotKeyService,
		private cref: ChangeDetectorRef,
		private settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService,
		private selectComponent: SelectComponentService) {
	}

	async ngOnInit() {
		// initially build grid
		this.buildGrid();
		// subscribe to all component resize and move changes
		this.selectComponent.addHandle('ALL_GRID', 'move', (dimensions: any)=>{
			this.buildGrid();
		});
		this.selectComponent.addHandle('ALL_GRID', 'resize', (dimensions: any)=>{
			this.buildGrid();
		});

		// create shortcuts
		if(this.settings.operatingPlatform === 'desktop' && !this.settings.blockMenus){
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
					this.undoManager.addChange();
					this.selectComponent.removeContainerCopySelector(this.container, true);
				}
			}, 'keydown');
			// delete selection
			this.hotKey.add('GRID_CONTROL_D', 'mod+d', (ID: string)=>{
				if(this.selectComponent.selectorList.length > 0){
					this.selectComponent.removeComponent('');
					// save config
					this.undoManager.addChange();
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
	}

	// deselect all components
	deselectComponents(): void{
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
	}

	// create context menu
	createContextMenu(e: any): void{
		if(!this.settings.blockMenus){
			const mouse: {x: number, y: number} = this.structure.getMousePosition(e);
			// component is created in room --> base level container in stack
			this.componentLoader.createSingleComponent('ContextMenuComponent', this.componentLoader.containerStack[0].container, {
				x: mouse.x,
				y: mouse.y,
				source: 'grid'
			});
		}
	}

	private buildGrid(): void{
		const parent: HTMLElement = this.container.element.nativeElement.parentNode;
		const parentW: number = parent.clientWidth;
		const parentH: number = parent.scrollHeight;
		// reset values
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
		this.cref.detectChanges();
	}

	ngOnDestroy(){
		this.selectComponent.removeHandle('ALL_GRID', 'move');
		this.selectComponent.removeHandle('ALL_GRID', 'resize');
		// remove hotkeys
		if(this.settings.operatingPlatform === 'desktop'){
			this.hotKey.remove('GRID_CONTROL_A');
			this.hotKey.remove('GRID_CONTROL_C');
			this.hotKey.remove('GRID_CONTROL_V');
			this.hotKey.remove('GRID_CONTROL_D');
			this.hotKey.remove('GRID_CONTROL_Z');
			this.hotKey.remove('GRID_CONTROL_Y');
		}
	}
}

@NgModule({
	imports: [ ClickerModule, CommonModule ],
	declarations: [ GridComponent ]
})
class GridComponentModule {}