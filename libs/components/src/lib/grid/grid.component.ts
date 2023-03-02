import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';

import { ContextMenuComponent } from '../context-menu/context-menu.component';

import { TransformationManagerDirective } from '@fhem-native/directives';

import { ContextMenuService, HotKeyService, SelectComponentService, StructureService, UndoRedoService } from '@fhem-native/services';
import { getUID } from '@fhem-native/utils';

@Component({
	selector: 'fhem-native-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent implements AfterViewInit, OnDestroy{
	private hotKeyUID = getUID();

	@ViewChild('Grid', {read: ElementRef}) grid!: ElementRef;

    // grid properties
	gridHeight = this.transformationManager.container.scrollHeight;
	gridW: Array<number> = [];
	gridH: Array<number> = [];

	trackByFn(index:any){ return index; }

    constructor(
		private cdr: ChangeDetectorRef,
		private hotKeys: HotKeyService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private contextMenu: ContextMenuService,
		public selectComponent: SelectComponentService,
		private transformationManager: TransformationManagerDirective){
	}

	ngAfterViewInit(): void {
		this.buildGrid();
		this.buildListener();
		this.registerHotkeys();
	}

	registerHotkeys(): void {
		// select all
		this.hotKeys.add(
			`GRID_CONTROL_A_${this.hotKeyUID}`, 'mod+a',
			()=> this.transformationManager.transformationItems.forEach(item=> this.selectComponent.buildSelector(item))
		);
		
		// copy selected
		this.hotKeys.add(
			`GRID_CONTROL_C_${this.hotKeyUID}`, 'mod+c',
			()=> this.selectComponent.copyComponents(),
			'info text'
		);

		// paste selected
		this.hotKeys.add(
			`GRID_CONTROL_V_${this.hotKeyUID}`, 'mod+v',
			()=>{
				if( this.selectComponent.pasteComponents(this.transformationManager.containerId) ){
					this.undoManager.addChange();
				}
			}
		);

		// delete selected
		this.hotKeys.add(
			`GRID_CONTROL_D_${this.hotKeyUID}`, 'mod+d',
			()=> {
				if( this.selectComponent.deleteComponents() ){
					this.undoManager.addChange();
				}
			}
		);

		// undo
		this.hotKeys.add(
			`GRID_CONTROL_Z_${this.hotKeyUID}`, 'mod+z',
			()=> this.undoManager.undoChange()
		);
		
		// redo
		this.hotKeys.add(
			`GRID_CONTROL_Y_${this.hotKeyUID}`, 'mod+y',
			()=> this.undoManager.redoChange()
		);
	}

	private buildGrid(): void{
		const gridDim = 100 / this.structure.getGridDecimal();

		this.gridW = this.getElems(gridDim);
		this.gridH = this.getElems(gridDim);

        this.cdr.detectChanges();
    }

	private buildListener(): void{
		fromEvent<TouchEvent|MouseEvent>(this.grid.nativeElement, 'click').subscribe(()=>{
			this.selectComponent.removeAllSelectors();
		});

		fromEvent<TouchEvent|MouseEvent>(this.grid.nativeElement, "contextmenu").subscribe(async (startEvent)=>{
			startEvent.preventDefault();

			await this.contextMenu.createContextMenu(ContextMenuComponent, startEvent, true, {
				source: 'grid', transformationManager: this.transformationManager
			});
		});
	}

	updateHeight(): void{
		// get height based on elements in relevant container
		const heights: number[] = [];
		this.transformationManager.transformationItems.forEach((section)=>{
			heights.push(section.hostEl.offsetTop + section.hostEl.clientHeight);
		});

		const newHeight = (Math.max(...heights) + 100);
		if(newHeight !== this.gridHeight){
			// create new items for scrollHeight > clientHeight (Exp. top: 102%)
			const baseGridDim = 100 / this.structure.getGridDecimal();
			const gridDim = Math.round(((newHeight / this.transformationManager.container.clientHeight) * 100) / this.structure.getGridDecimal());

			this.gridH = this.getElems( (gridDim > baseGridDim ? gridDim : baseGridDim), baseGridDim);

			this.gridHeight = newHeight;
			this.cdr.detectChanges();
		}
	}

	private getElems(lengthParam: number, divider?: number): number[]{
		divider = divider || lengthParam;

		const res = []
		for (let i = 0; i < lengthParam; i++) {
			res.push( i * 100 / divider );
		}
		return res;
	}

	ngOnDestroy(): void {
		this.hotKeys.remove(`GRID_CONTROL_A_${this.hotKeyUID}`);
		this.hotKeys.remove(`GRID_CONTROL_C_${this.hotKeyUID}`);
		this.hotKeys.remove(`GRID_CONTROL_V_${this.hotKeyUID}`);
		this.hotKeys.remove(`GRID_CONTROL_D_${this.hotKeyUID}`);
		this.hotKeys.remove(`GRID_CONTROL_Z_${this.hotKeyUID}`);
		this.hotKeys.remove(`GRID_CONTROL_Y_${this.hotKeyUID}`);
	}
}