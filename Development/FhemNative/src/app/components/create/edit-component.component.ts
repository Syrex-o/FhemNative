import { Component, Input, AfterViewInit, ElementRef, HostListener } from '@angular/core';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';
import { HelperService } from '../../services/helper.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
	selector: 'edit-component',
	template: `
		<div class="context-menu" [ngStyle]="{'left.px': x, 'top.px': y}" [ngClass]="settings.app.theme">
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="showSettings = true;" class="settings">{{ 'GENERAL.EDIT_COMPONENT.MENU.SETTINGS' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="sendToFront()" class="top">{{ 'GENERAL.EDIT_COMPONENT.MENU.FOREGROUND' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="sendToBack()">{{ 'GENERAL.EDIT_COMPONENT.MENU.BACKGROUND' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="select()">{{ !evalSelector(component) ? ('GENERAL.EDIT_COMPONENT.MENU.SELECT' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.UNSELECT' | translate) }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="selectAll()">{{ 'GENERAL.EDIT_COMPONENT.MENU.SELECT_ALL' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="copyComp()">{{ 'GENERAL.EDIT_COMPONENT.MENU.COPY' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="structure.componentCopy.length > 0 && source !== 'component'" (click)="pasteComp()">{{ 'GENERAL.EDIT_COMPONENT.MENU.PASTE' | translate }}</p>
			<p matRipple [matRippleColor]="'#d4d4d480'" *ngIf="source === 'component'" (click)="compDelete()" class="delete top">{{ 'GENERAL.EDIT_COMPONENT.MENU.DELETE' | translate }}</p>
		</div>
		<picker
			*ngIf="component"
			[height]="'65%'"
			[confirmBtn]="'GENERAL.BUTTONS.SAVE' | translate"
			[cancelBtn]="'GENERAL.BUTTONS.CANCEL' | translate"
			[(ngModel)]="showSettings"
			(onConfirm)="saveComponent()"
			[ngClass]="settings.app.theme">
			<div class="create-container edit">
				<h2>{{ 'GENERAL.CREATE_COMPONENT.PAGE_2_INFO' | translate }} {{'COMPONENTS.'+[component.name]+'.NAME' | translate}}</h2>
				<p>{{ 'GENERAL.EDIT_COMPONENT.EDIT.TITLE' | translate }}</p>
				<div class="config-data" *ngFor="let data of component.attributes.attr_data">
					<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.name' | translate }}</p>
					<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.info' | translate }}</p>
					<input [(ngModel)]="data.value" placeholder="{{data.value}}">
		      		<span class="bar"></span>
				</div>
				<div class="config-data toggle" *ngFor="let data of component.attributes.attr_bool_data">
					<switch
						[customMode]="true"
						[(ngModel)]="data.value"
						[label]="'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.name' | translate"
						[subTitle]="'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.info' | translate"
						[padding]="false">
					</switch>
				</div>
				<div class="config-data" *ngFor="let data of component.attributes.attr_arr_data">
					<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.name' | translate }}</p>
					<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[data.attr]+'.info' | translate }}</p>
					<ng-select [items]="data.defaults"
						[searchable]="false"
					    [(ngModel)]="data.value[0]">
					    <ng-template ng-option-tmp let-item="item" let-index="index">
					       	<span class="label">{{item}}</span>
					    </ng-template>
					</ng-select>
				</div>
				<div class="config-data" *ngFor="let icon of component.attributes.attr_icon">
					<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[icon.attr]+'.name' | translate }}</p>
					<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[icon.attr]+'.info' | translate }}</p>
					<ng-select [items]="settings.icons"
						[searchable]="false"
						bindLabel="icon"
						bindValue="icon"
						placeholder="icon.value"
						[(ngModel)]="icon.value">
						<ng-template ng-option-tmp let-item="item" let-index="index">
						    <ion-icon *ngIf="item.type === 'ion'" [name]="item.icon"></ion-icon>
						    <fa-icon *ngIf="item.type != 'ion'" [icon]="[item.type, item.icon]"></fa-icon>
						    <span class="label">{{item.icon}}</span>
						</ng-template>
					</ng-select>
				</div>
				<div class="style" *ngIf="component.attributes.attr_style?.length > 0">
					<p>{{ 'GENERAL.EDIT_COMPONENT.EDIT.STYLE' | translate }}</p>
					<div class="config-data" *ngFor="let style of component.attributes.attr_style">
						<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
						<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
						<ng-select [items]="settings.componentColors" 
							[(ngModel)]="style.value" 
							[addTag]="true">
					        <ng-template ng-option-tmp let-item="item" let-index="index">
					          	<span class="color" [style.background]="item"></span>
					           	<span class="color-label">{{item}}</span>
					        </ng-template>
					    </ng-select>
					</div>
					<div class="config-data" *ngFor="let style of component.attributes.attr_arr_style">
						<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
						<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
						<ng-select [items]="settings.componentColors" 
							[(ngModel)]="style.value" 
							[multiple]="true"
							[addTag]="true">
					        <ng-template ng-option-tmp let-item="item" let-index="index">
					          	<span class="color" [style.background]="item"></span>
					           	<span class="color-label">{{item}}</span>
					        </ng-template>
					    </ng-select>
					</div>
				</div>
			</div>
		</picker>
	`,
	styleUrls: ['./create-style.scss']
})
export class EditComponentComponent implements AfterViewInit {

	constructor(
		public structure: StructureService,
		public settings: SettingsService,
		private ref: ElementRef,
		private createComponent: CreateComponentService,
		private helper: HelperService,
		private undoManager: UndoRedoService) {
	}

	static key = 'EditComponentComponent';
	@Input() x: number;
	@Input() y: number;

	// The source from the injector
	// identify if double click on grod or component
	// used for identification of copy and paste methods
	@Input() source: string;

	// The component ID from double click selection
	@Input() componentID;
	// The container of the component
	@Input() container;

	// selected component in structure
	public component: any;

	// currently active components
	private roomComponents: any;

	public showSettings = false;

	// @HostListener('document:click', ['$event'])
	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target'])
	onClick(target) {
		if (!this.ref.nativeElement.contains(target) && target.className.indexOf('ng-option') == -1 && target.className.indexOf('ng-value-icon') == -1 && target.className.indexOf('label') == -1) {
			this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
		}
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if (this.source === 'component') {
				this.component = this.structure.selectedElement(this.componentID, this.container);
				// fix for arr_data function calling --> getting defaults
				if (this.component.attributes.attr_arr_data && this.component.attributes.attr_arr_data.length > 0) {
					for (let i = 0; i < this.component.attributes.attr_arr_data.length; i++) {
						this.component.attributes.attr_arr_data[i].defaults = this.createComponent.getValues(this.component.REF, this.component.attributes.attr_arr_data[i].attr);
					}
				}
			}
			if((this.structure.componentCopy.length > 0 && this.source !== 'component') || this.source === 'component'){
				// getting the room components
				this.roomComponents = this.structure.roomComponents(this.container);
				// alligning x and y values to fit in container
				const menu = this.ref.nativeElement.querySelector('.context-menu');
				const container = this.createComponent.currentRoomContainer.element.nativeElement.parentNode.getBoundingClientRect();
				let x = 0; let y = 0;
				if (this.x + menu.clientWidth >= container.width) {
					x = -100;
				}
				if (this.y + menu.clientHeight >= container.height) {
					y = -100;
				}
				menu.style.transform = 'translate3d(' + x + '%,' + y + '%, 0)';
			}else{
				this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
			}
		}, 0);
	}

	// addjusting z-index to front
	public sendToFront() {
		for (let i = 0; i < this.roomComponents.length; i++) {
			if (this.component.ID !== this.roomComponents[i].ID) {
				this.roomComponents[i].position.zIndex = (this.roomComponents[i].position.zIndex === 1) ? 1 : (this.roomComponents[i].position.zIndex - 1);
				this.changeAttr(this.roomComponents[i].ID, 'zIndex', this.roomComponents[i].position.zIndex);
			}
		}
		this.component.position.zIndex = Math.max(...this.zIndexValues(this.component)) + 1;
		this.changeAttr(this.component.ID, 'zIndex', this.component.position.zIndex);
		this.saveComp();
	}

	// addjusting z-index to back
	public sendToBack() {
		for (let i = 0; i < this.roomComponents.length; i++) {
			if (this.component.ID !== this.roomComponents[i].ID) {
				this.roomComponents[i].position.zIndex = this.roomComponents[i].position.zIndex + 1;
				this.changeAttr(this.roomComponents[i].ID, 'zIndex', this.roomComponents[i].position.zIndex);
			}
		}
		this.component.position.zIndex = 1;
		this.changeAttr(this.component.ID, 'zIndex', this.component.position.zIndex);
		this.saveComp();
	}

	private changeAttr(componentID, attr, value) {
		const elem = this.createComponent.findFhemComponent(componentID);
		if (elem) {
			elem.item.instance[attr] = value;
		}
	}

	private zIndexValues(comp) {
		const zIndex = [];
		for (let i = 0; i < this.roomComponents.length; i++) {
			if (this.roomComponents[i].ID !== comp.ID) {
				zIndex.push(this.roomComponents[i].position.zIndex);
			}
		}
		return zIndex;
	}

	// copy the selected component
	public copyComp() {
		// clear the copy container before filling
		this.structure.componentCopy = [];
		const roomElements = this.structure.roomComponents(this.container);
		roomElements.forEach((el)=>{
			const element = document.getElementById(el.ID);
			if(element.classList.contains('selected-for-copy')){
				this.structure.componentCopy.push(JSON.parse(JSON.stringify(el)));
			}
		});
		// check if selection was made
		// else copyComp gets filled with the selected component
		if(this.structure.componentCopy.length === 0){
			this.structure.componentCopy.push(JSON.parse(JSON.stringify(this.component)));
			document.getElementById(this.component.ID).classList.add('selected-for-copy');
		}
		this.removeSelector();
	}

	// sets selection marker to all single component
	public select(){
		const element = document.getElementById(this.component.ID);
		if(element.classList.contains('selected-for-copy')){
			element.classList.remove('selected-for-copy');
		}else{
			element.classList.add('selected-for-copy');
		}
		this.removeSelector();
	}

	// sets selection marker to all components
	public selectAll(){
		const roomElements = this.structure.roomComponents(this.container);
		roomElements.forEach((el)=>{
			const element = document.getElementById(el.ID);
			if(!element.classList.contains('selected-for-copy')){
				element.classList.add('selected-for-copy');
			}
		});
		this.removeSelector();
	}

	// copy selection remover
	// used for dynamic container switching while selecting
	private removeSelector(){
		const containerComponents = this.structure.roomComponents(this.container);
		const selectorList = document.querySelectorAll('.selected-for-copy');
		selectorList.forEach((selector)=>{
			if(!containerComponents.find(x=>x.ID === selector.id)){
				selector.classList.remove('selected-for-copy');
			}
		});
	}

	public evalSelector(comp){
		if(comp && document.getElementById(comp.ID)){
			if(document.getElementById(comp.ID).classList.contains('selected-for-copy')){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	public pasteComp() {
		const copyList = JSON.parse(JSON.stringify(this.structure.componentCopy));
		copyList.forEach((copy)=>{
			// ensure that no container components are inserted into each other
			if (
				(!copy.attributes.components && this.container.element.nativeElement.parentNode.id.match(/(popup|swiper)/)) ||
				(!copy.attributes.components && !this.container.element.nativeElement.parentNode.id.match(/(popup|swiper)/)) ||
				(copy.attributes.components && !this.container.element.nativeElement.parentNode.id.match(/(popup|swiper)/))
			){
				// generate new component ID
				copy.ID = this.helper.UIDgenerator();
				// check if copy is a component container
				if (copy.attributes.components) {
					for (let i = 0; i < copy.attributes.components.length; i++) {
						if (copy.attributes.components[i].components) {
							// container is a multi component container
							for (let j = 0; j < copy.attributes.components[i].components.length; j++) {
								copy.attributes.components[i].components[j].ID = this.helper.UIDgenerator();
							}
						} else {
							// container is a single component container
							copy.attributes.components[i].ID = this.helper.UIDgenerator();
						}
					}
				}
				// setting new position to 20 px below current position
				copy.position.top = parseInt(copy.position.top)+ 20 +'px';

				this.roomComponents.push(copy);
				this.createComponent.loadRoomComponents([copy], this.container, false);
			}
		});
		this.saveComp();
	}

	// delete the selected component
	public compDelete() {
		const removeList = [];
		// remove edit component before slice, to skip selection text error
		this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);

		const roomElements = this.structure.roomComponents(this.container);
		roomElements.forEach((el)=>{
			const element = document.getElementById(el.ID);
			if(element.classList.contains('selected-for-copy')){
				removeList.push(JSON.parse(JSON.stringify(el)));
			}
		});
		if(removeList.length === 0){
			removeList.push(JSON.parse(JSON.stringify(this.component)));
		}

		// remove the selected elements
		removeList.forEach((el)=>{
			this.createComponent.removeFhemComponent(el.ID);
			this.roomComponents.splice(
				this.helper.find(this.roomComponents, 'ID', el.ID).index, 1
			);
		});
		this.saveComp();
	}

	public saveComponent() {
		// determine if component has multiple containers
		if (this.component.attributes.components && this.component.attributes.components[0].components) {
			// data_pages is the unique way to define multiple container components
			let pages = parseInt(this.component.attributes.data.find(x => x.attr === 'data_pages').value);
			// ensure, that pages are positive and not 0
			pages = Math.abs(pages) === 0 ? 1 : Math.abs(pages);

			const diff = this.component.attributes.components.length - pages;

			// determine if page size got bigger or smaller
			if (diff < 0) {
				// page size got bigger
				for (let i = 0; i < Math.abs(diff); i++) {
					this.component.attributes.components.push({
						components: []
					});
				}
			} else {
				// page size got smaller
				this.component.attributes.components.splice(
					this.component.attributes.components.length - (this.component.attributes.components.length - pages),
					this.component.attributes.components.length
				);
			}
		}
		this.settings.findNewColors([this.component.attributes.attr_style, this.component.attributes.attr_arr_style]);
		this.createComponent.removeFhemComponent(this.componentID);
		this.createComponent.loadRoomComponents([this.component], this.container, false);
		this.saveComp();
	}

	// saving rooms
	private saveComp() {
		// removing the editor
		this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
		// add to change stack
		this.undoManager.addChange();
	}
}
