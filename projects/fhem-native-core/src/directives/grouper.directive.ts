import { Directive, Input, ElementRef, OnInit, Renderer2, OnDestroy, NgModule } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
import { EventHandlerService } from '../services/event-handler.service';
import { SelectComponentService } from '../services/select-component.service';

// Interfaces
import { DynamicComponentDefinition } from '../interfaces/interfaces.type';

@Directive({ selector: '[grouper]' })
export class GrouperDirective implements OnInit, OnDestroy{
	// move handle ID
	private handleID: string = this.settings.getUID();
	// reference to the element
	private hostEl: HTMLElement;
	private containerComponents!: DynamicComponentDefinition[]|null;
	private createdGroups: HTMLElement[] = [];
	private editSub!: Subscription;
	private groupHandler!: Subscription;

	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	@Input() containerID: any;

	constructor(
		private ref: ElementRef,
		private renderer: Renderer2,
		private settings: SettingsService,
		private structure: StructureService,
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService){
		// create the reference
		this.hostEl = ref.nativeElement;
	}

	ngOnInit(){
		// subscribe to mode changes
		this.editSub = this.settings.modeSub.subscribe(next =>{
			if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
				this.checkGroups();
				// build event handler for move
				this.buildEventHandler();
				this.buildGroupHandler();
			}else{
				this.removeGroupHighlights();
				this.eventHandler.removeHandle(this.handleID);
				if(this.groupHandler) this.groupHandler.unsubscribe();
			}
		});
		// initial chack
		if(this.settings.modes.roomEdit){
			this.checkGroups();
			// build event handler for move
			this.buildEventHandler();
			this.buildGroupHandler();
		}
	}

	private buildGroupHandler(): void{
		if(this.groupHandler) this.groupHandler.unsubscribe();
		// manual group checker from menu triggers
		this.groupHandler = this.selectComponent.groupHandler.subscribe(()=>{
			this.checkGroups();
		});
	}

	private checkGroups(): void{
		// secure timeout to allow group creation from context menu
		this.containerComponents = this.structure.getComponentContainer(this.hostEl);
		if(this.containerComponents){
			const shouldCheck: boolean = this.structure.canEditContainer(this.containerID);
			if(shouldCheck){
				this.checkForGroupCreation();
			}else{
				this.removeGroupHighlights();
			}
		}
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.handleID);
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			// remove only on relevant touch
			if(target.className.match(/overlay-move|rect|rotatation-handle/)){
				this.removeGroupHighlights();
			}

			const endMove = (e: TouchEvent|MouseEvent): void => {
				// remove listeners
				document.removeEventListener('mouseup', endMove);
				document.removeEventListener('touchend', endMove);
				this.checkGroups();
			}

			document.addEventListener('mouseup', endMove, {passive: true});
			document.addEventListener('touchend', endMove, {passive: true});
		};
		this.eventHandler.handle(this.handleID, this.hostEl, startMove);
	}

	private checkForGroupCreation(): void{
		if(this.containerComponents){
			const isGrouped = this.selectComponent.isGroupedAny(this.containerComponents);
			if(isGrouped){
				this.createGroupHighlights();
			}else{
				this.removeGroupHighlights();
			}
		}
	}


	private createGroupHighlights(): void{
		this.removeGroupHighlights();

		let groupsToCreate: string[] = [];
		if(this.containerComponents){
			this.containerComponents.forEach((component: DynamicComponentDefinition)=>{
				const group = this.selectComponent.isGrouped(component.ID || '');
				if(group && !groupsToCreate.includes(group.group)){
					groupsToCreate.push(group.group);
				}
			});
		}

		// loop relevant groups
		groupsToCreate.forEach((group: string)=>{
			const highlight: HTMLElement = this.renderer.createElement('div');
			this.renderer.addClass(highlight, 'group-highlight');
			this.renderer.setProperty(highlight, 'id', group);
			// add elem
			this.renderer.appendChild(this.hostEl, highlight);

			// set style of group
			const groupStyle = this.getGroupStyle(group);
			this.renderer.setStyle(highlight, 'top', groupStyle.top + 'px');
			this.renderer.setStyle(highlight, 'left', groupStyle.left + 'px');
			this.renderer.setStyle(highlight, 'width', groupStyle.width + 'px');
			this.renderer.setStyle(highlight, 'height', groupStyle.height + 'px');

			this.createdGroups.push(highlight);
		});
	}

	private removeGroupHighlights(): void{
		this.createdGroups.forEach((group: HTMLElement)=>{
			this.renderer.removeChild(this.hostEl, group);
		});
	}

	private getGroupStyle(group: string): any{
		const groupStyle = {top: 0, left: 0, width: 0, height: 0};
		const boundings: any = {top: [], left: [], width: [], height: [], right: [], bottom: []};
		const container: ClientRect = this.hostEl.getBoundingClientRect();

		const groups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
		if( groups && groups[group] ){
			// get container offsets
			groups[group].forEach((componentID: string)=>{
				const component: HTMLElement|null = document.getElementById(componentID);
				if(component){
					// get bounding
					const bounding: ClientRect = component.getBoundingClientRect();
					boundings.top.push(bounding.top);
					boundings.left.push(bounding.left);
					boundings.width.push(bounding.width);
					boundings.height.push(bounding.height);
					boundings.right.push(container.right - bounding.right);
					boundings.bottom.push(container.bottom - bounding.bottom);
				}
			});
		}

		// add one grid spacing
		groupStyle.top = this.structure.roundToGrid( ( (Math.min(...boundings.top) - container.top) + this.hostEl.scrollTop) - this.settings.app.grid.gridSize );
		groupStyle.left = this.structure.roundToGrid( (Math.min(...boundings.left) - container.left) - this.settings.app.grid.gridSize );
		groupStyle.width = this.structure.roundToGrid( container.width - (Math.min(...boundings.right) + groupStyle.left) + this.settings.app.grid.gridSize );
		groupStyle.height = this.structure.roundToGrid( (container.height + this.hostEl.scrollTop) - (Math.min(...boundings.bottom) + groupStyle.top ) + this.settings.app.grid.gridSize );

		return groupStyle;
	}

	ngOnDestroy(){
		if(this.editSub) this.editSub.unsubscribe();
		if(this.groupHandler) this.groupHandler.unsubscribe();
		this.eventHandler.removeHandle(this.handleID);
	}
}
@NgModule({
	declarations: [ GrouperDirective ],
	exports: [ GrouperDirective ]
})
export class GrouperModule {}