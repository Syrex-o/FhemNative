import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener, Input } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';
import { SelectComponentService } from '../../services/select-component.service';
import { ShortcutService } from '../../services/shortcut.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
	selector: 'grid',
	template: `
		<div
			class="grid"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			[source]="'grid'"
			(onDoubleClick)="loadContextMenu($event)"
			(onRightClick)="loadContextMenu($event)"
			(onLongClick)="loadContextMenu($event)">
			<span *ngFor="let w of gridW; let i = index;" class="grid-line w" [ngStyle]="{'left.px': w, 'height.px': gridHeight}" [ngClass]="(i+1) % 7 == 0 ? 'bold' : ''"></span>
			<span *ngFor="let h of gridH; let i = index;" class="grid-line h" [ngStyle]="{'top.px': h}" [ngClass]="(i+1) % 7 == 0 ? 'bold' : ''"></span>
		</div>
	`,
	styles: [`
		.grid{
			min-height: 100%;
			width: 100%;
			position: absolute;
			left: 0;
			top: 0;
		}
		.grid-line{
		    position: absolute;
		    background: #ddd;
		    opacity: 0.2;
		}
		.grid-line.w{
		    width: 1px;
		    height: 100%;
		}
		.grid-line.h{
		    width: 100%;
		    height: 1px;
		    left: 0;
		}
		.grid-line.w.bold{
		    width: 2px;
		    transform: translateX(-1px);
		}
		.grid-line.h.bold{
		    height: 2px;
		    transform: translateY(-1px);
		}
	`]
})

export class GridComponent implements OnInit, OnDestroy {
	private killShortcuts = new Subject<void>();

	private shortCuts: any = {};

	// listen to editing
	private editSub: Subscription;

	private shiftPress: boolean = false;

	constructor(
		public settings: SettingsService,
		private createComponent: CreateComponentService,
		private selectComponent: SelectComponentService,
		private shortcuts: ShortcutService,
		private undoManager: UndoRedoService) {
	}

	static key = 'GridComponent';
	@Input() container;

	private Grid: ElementRef;
	// Grid Elements
	public gridW: Array<any>;
  	public gridH: Array<any>;
  	// Grid Height
  	public gridHeight = 0;
  	public gridHeightPopup = 0;

  	// parent container
  	// used for width and height
  	private parent: any;

	private scrollL = this.scroll.bind(this);

	@HostListener('window:resize', ['$event'])
	onResize(e) {
		this.buildGrid();
	}

	// rectangle press creation
	@HostListener('touchstart', ['$event'])
	@HostListener('mousedown', ['$event'])
	onMouseDown(e) {
		if(this.shiftPress){
			this.createComponent.createSingleComponent('SelectRectangleComponent', this.container, {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
				container: this.container
			});
		}
	}

	private scroll(e) {
		if (e) {
			if (e.target.scrollHeight !== this.gridHeight) {
				this.buildGrid();
			}
		}
	}

	ngOnInit() {
		this.buildGrid();
		// scroll listener
		setTimeout(() => {
			document.getElementById(this.container.element.nativeElement.parentNode.id).addEventListener('scroll', this.scrollL);
		}, 0);

		// add shortcuts
		this.buildShortcuts();
		// listen to mode changes
		this.editSub = this.settings.modeSub.subscribe(next =>{
			if(next.hasOwnProperty('showComponentConfig')){
				if(next.showComponentConfig){
					this.removeShortcuts();
				}else{
					this.buildShortcuts();
				}
			}
		});
	}

	private buildShortcuts(){
		this.removeShortcuts();
		// select/deselect all
		this.shortCuts['controlA'] = this.shortcuts.addShortcut({ keys: 'Control.a' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			console.log('hi');
			if(!this.selectComponent.evalCopySelectorAll(this.container)){
				// not all components selected
				this.selectComponent.buildCopySelectorAll(this.container);
			}else{
				// all components are selected
				this.selectComponent.removeContainerCopySelector(this.container, true);
			}
			this.selectComponent.buildCopySelectorAll
		});
		// copy selection
		this.shortCuts['controlC'] = this.shortcuts.addShortcut({ keys: 'Control.c' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			if(this.selectComponent.selectorList.length > 0){
				this.selectComponent.copyComponent(false, this.container);
			}
		});
		// paste selection
		this.shortCuts['controlV'] = this.shortcuts.addShortcut({ keys: 'Control.v' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			if(this.selectComponent.copyList.length > 0){
				this.selectComponent.pasteComponent(this.container);
				// save config
				this.saveComp();
				this.selectComponent.removeContainerCopySelector(this.container, true);
			}
		});
		// delete selection
		this.shortCuts['controlD'] = this.shortcuts.addShortcut({ keys: 'Control.d' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			if(this.selectComponent.selectorList.length > 0){
				this.selectComponent.removeComponent(false, this.container);
				// save config
				this.saveComp();
			}
		});
		// undo 
		this.shortCuts['controlZ'] = this.shortcuts.addShortcut({ keys: 'Control.z' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			this.undoManager.undoChange();
		});
		// redo 
		this.shortCuts['controlY'] = this.shortcuts.addShortcut({ keys: 'Control.y' }, false).pipe(takeUntil(this.killShortcuts)).subscribe(()=>{
			this.undoManager.redoChange();
		});
		// select rectangle
		this.shortCuts['shift'] = this.shortcuts.addShortcut({ keys: 'Shift' }, true).pipe(takeUntil(this.killShortcuts)).subscribe((e: Event)=>{
			this.shiftPress = e.type === 'keydown' ? true : false;
			if(!this.shiftPress){
				this.createComponent.removeSingleComponent('SelectRectangleComponent', this.container);
			}
		});
	}

	// remove shortcuts
	private removeShortcuts(){
		for(const key of Object.keys(this.shortCuts)){
			this.shortCuts[key].unsubscribe();
		}
	}

	// load context menu
	public loadContextMenu(e) {
		this.createComponent.createSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer, {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
			source: 'grid',
			container: this.container
		});
	}

	// remove context menu
	private removeContextMenu(){
		this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
	}

	private getParentDimensions() {
		this.parent = {
			width: this.container.element.nativeElement.parentNode.clientWidth,
			height: this.container.element.nativeElement.parentNode.scrollHeight
		};
	}

	ngOnDestroy() {
		if (this.container.element.nativeElement.parentNode.id) {
			document.getElementById(this.container.element.nativeElement.parentNode.id).removeEventListener('scroll', this.scrollL);
		}

		// remove shortcuts
		this.killShortcuts.next();
		this.killShortcuts.complete();
		// remove select rect
		this.createComponent.removeSingleComponent('SelectRectangleComponent', this.container);
		// unsubscribe
		this.editSub.unsubscribe();
	}

	// refers to same logic as edit component
	private saveComp(){
		// removing the editor
		this.removeContextMenu();
		// add to change stack
		this.undoManager.addChange();
	}

	private buildGrid() {
		setTimeout(() => {
			this.getParentDimensions();
			this.gridW = [];
	  		this.gridH = [];
	  		const gridW = this.parent.width;
	  		const gridH = this.parent.height;
	  		this.gridHeight = gridH;
			const WS = Math.floor(gridW / this.settings.app.grid.gridSize);
	  		const HS = Math.floor(gridH / this.settings.app.grid.gridSize);
	  		for (let i = 1; i <= WS; i++) {
		      	this.gridW.push(this.settings.app.grid.gridSize * i);
		    }
		 	for (let i = 1; i <= HS; i++) {
		      	this.gridH.push(this.settings.app.grid.gridSize * i);
		    }
		}, 0);
	}
}
