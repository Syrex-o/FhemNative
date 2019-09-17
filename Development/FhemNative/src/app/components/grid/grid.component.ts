import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener, Input } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { CreateComponentService } from '../../services/create-component.service';

@Component({
	selector: 'grid',
	template: `
		<div
			class="grid"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			[source]="'grid'"
			(onDoubleClick)="loadContextMenu($event)">
			<span *ngFor="let w of gridW; let i = index;" class="line w" [ngStyle]="{'left.px': w, 'height.px': gridHeight}" [ngClass]="(i+1) % 7 == 0 ? 'bold' : ''"></span>
			<span *ngFor="let h of gridH; let i = index;" class="line h" [ngStyle]="{'top.px': h}" [ngClass]="(i+1) % 7 == 0 ? 'bold' : ''"></span>
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
		.line{
		    position: absolute;
		    background: #ddd;
		    opacity: 0.2;
		}
		.line.w{
		    width: 1px;
		    height: 100%;
		}
		.line.h{
		    width: 100%;
		    height: 1px;
		    left: 0;
		}
		.line.w.bold{
		    width: 2px;
		    transform: translateX(-1px);
		}
		.line.h.bold{
		    height: 2px;
		    transform: translateY(-1px);
		}
	`]
})

export class GridComponent implements OnInit, OnDestroy {

	constructor(
		public settings: SettingsService,
		private createComponent: CreateComponentService,
		private structure: StructureService) {
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
	}

	public loadContextMenu(e) {
		if (this.structure.componentCopy) {
			this.createComponent.createSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer, {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
				source: 'grid',
				container: this.container
			});
		}
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
