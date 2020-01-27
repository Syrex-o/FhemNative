import { Component, Input, AfterViewInit, OnDestroy, ElementRef, HostListener } from '@angular/core';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';
import { SelectComponentService } from '../../services/select-component.service';
import { HelperService } from '../../services/helper.service';
import { UndoRedoService } from '../../services/undo-redo.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'edit-component',
	template: `
		<div class="context-menu" [ngStyle]="{'left.px': x, 'top.px': y}" [ngClass]="settings.app.theme">
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="toggleComponentSettings()" 
				class="select-item settings">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.SETTINGS' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="toggleComponentDetails()" 
				class="select-item top">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.DETAILS' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="pinComponent()" 
				class="select-item">
				{{ component?.pinned ? ('GENERAL.EDIT_COMPONENT.MENU.UNPIN' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.PIN' | translate) }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="sendToFront()" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.FOREGROUND' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="sendToBack()" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.BACKGROUND' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' && component" 
				class="select-item" 
				(click)="selectComponent.buildCopySelector(component.ID, true, container)">
				{{ !selectComponent.evalCopySelector(component.ID) ? ('GENERAL.EDIT_COMPONENT.MENU.SELECT' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.UNSELECT' | translate) }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'"
				class="select-item" 
				(click)="!selectComponent.evalCopySelectorAll(container) ? selectComponent.buildCopySelectorAll(container) : selectComponent.removeContainerCopySelector(container, true)">
				{{ !selectComponent.evalCopySelectorAll(container) ? ('GENERAL.EDIT_COMPONENT.MENU.SELECT_ALL' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.DESELECT_ALL' | translate) }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' || (source !== 'component' && selectComponent.selectorList.length > 0)" 
				class="select-item" 
				(click)="copyComp()">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.COPY' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' && component && selectComponent.selectorList.length > 1" 
				class="select-item"
				(click)="groupComponents(selectComponent.isGrouped(componentID))">
				{{ !selectComponent.isGrouped(componentID) ? ('GENERAL.EDIT_COMPONENT.MENU.GROUP' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.UNGROUP' | translate) }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="selectComponent.copyList.length > 0 && source !== 'component'" 
				class="select-item" 
				(click)="pasteComp()">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.PASTE' | translate }}
			</p>
			<p matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' || (source !== 'component' && selectComponent.selectorList.length > 0)"
				(click)="compDelete()" 
				class="select-item delete top">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.DELETE' | translate }}
			</p>
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
				<div class="header">
					<h2>{{ 'GENERAL.CREATE_COMPONENT.PAGE_2_INFO' | translate }} {{'COMPONENTS.'+[component.name]+'.NAME' | translate}}</h2>
					<div class="change-component">
						<p>{{ 'GENERAL.EDIT_COMPONENT.MENU.SWITCH.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.EDIT_COMPONENT.MENU.SWITCH.INFO' | translate }}</p>
						<ng-select [items]="componentList.components"
							bindLabel="name"
							bindValue="ID"
							[(ngModel)]="componentList.selected"
							[searchable]="false"
							[clearable]="false"
							(change)="changeSelectedComponent($event)">
							<ng-template ng-option-tmp let-item="item" let-index="index">
							   	<span class="label">{{item.name}}</span>
							</ng-template>
						</ng-select>
					</div>
				</div>
				<div class="content">
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
					<div class="config-data" *ngFor="let icon of component.attributes.attr_arr_icon">
						<p>{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[icon.attr]+'.name' | translate }}</p>
						<p class="des">{{ 'COMPONENTS.'+[component.name]+'.INPUTS.'+[icon.attr]+'.info' | translate }}</p>
						<ng-select [items]="settings.icons"
							[searchable]="false"
							bindLabel="icon"
							bindValue="icon"
							placeholder="icon.value"
							[multiple]="true"
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
		<picker
			*ngIf="component && componentDetails?.fhem"
			[height]="'65%'"
			[confirmBtn]="'GENERAL.BUTTONS.OKAY' | translate"
			[showCancelBtn]="false"
			[(ngModel)]="componentDetails.show"
			[ngClass]="settings.app.theme">
			<div class="create-container edit">
				<h2>{{ 'GENERAL.EDIT_COMPONENT.MENU.DETAILS' | translate }}: {{'COMPONENTS.'+[component.name]+'.NAME' | translate}}</h2>
				<div class="config-data">
					<p class="head">{{ 'GENERAL.DICTIONARY.COMPONENT' | translate }}:</p>
					<div class="details-row" *ngFor="let detail of componentDetails.component | keyvalue">
						<span class="key">{{detail.key}}:</span>
						<span class="value">{{detail.value}}</span>
					</div>
				</div>
				<div class="config-data">
					<p class="head">{{ 'GENERAL.DICTIONARY.ROOM' | translate }}:</p>
					<div class="details-row" *ngFor="let detail of componentDetails.room | keyvalue">
						<span class="key">{{detail.key}}:</span>
						<span class="value">{{detail.value}}</span>
					</div>
				</div>
				<div class="config-data">
					<p class="head">FhemNative userAttr Definition:</p>
					<div class="details-row">
						<span class="key">userAttr:</span>
						<span class="value">{{componentDetails.fhem.userAttr}}</span>
					</div>
					<p>{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.SHORT.TITLE' | translate }}</p>
					<p class="des">{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.SHORT.INFO' | translate }}</p>
					<p>{{componentDetails.fhem.value.short}}</p>

					<p>{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.LONG.TITLE' | translate }}</p>
					<p class="des">{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.LONG.INFO' | translate }}</p>
					<p>{{componentDetails.fhem.value.long}}</p>
				</div>
			</div>
		</picker>
	`,
	styleUrls: ['./create-style.scss']
})
export class EditComponentComponent implements AfterViewInit, OnDestroy {

	constructor(
		public structure: StructureService,
		public settings: SettingsService,
		private ref: ElementRef,
		private createComponent: CreateComponentService,
		public selectComponent: SelectComponentService,
		private helper: HelperService,
		private undoManager: UndoRedoService,
		private translate: TranslateService) {
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

	// show settings picker
	public showSettings: boolean = false;

	// component details
	public componentDetails: any = {
		show: false
	};

	// component list to select from
	public componentList: any = {
		components: [],
		selected: null
	};

	// @HostListener('document:click', ['$event'])
	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target'])
	onClick(target) {
		if (
			!this.ref.nativeElement.contains(target) && 
			target.className.indexOf('ng-option') === -1 && 
			target.className.indexOf('ng-value-icon') === -1 && 
			target.className.indexOf('label') === -1 && 
			target.className.indexOf('ion-alert') === -1
		) {
			// remove menu
			this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
		}
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if (this.source === 'component') {
				// get all compoennts for selection menu
				this.componentList.components = this.structure.getComponentContainer(this.container);
				this.componentList.selected = this.componentID;
				// get component values
				this.getComponentData(this.componentID);
				// change mode
				this.settings.modeSub.next({showComponentConfig: true});
			}
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
		}, 0);
	}

	public toggleComponentSettings(){
		this.getComponentData(this.componentID); 
		this.componentList.selected = this.componentID;
		this.showSettings = true;
	}

	public changeSelectedComponent(event){
		this.getComponentData(this.componentList.selected);
	}

	// get the relevant component info
	private getComponentData(id){
		this.component = this.structure.getComponent(id);
		const defaults = this.createComponent.seperateComponentValues(this.helper.find(this.createComponent.fhemComponents, 'REF', this.component.REF).item.component);
		// look for new props in component
		for(const key of Object.keys(defaults)){
			// check for new attribute
			if( !(key in this.component.attributes) ){
				this.component.attributes[key] = defaults[key];
			}
			// assign default to new attribute
			defaults[key].forEach((value)=>{
				if( !this.component.attributes[key].find(x=> x.attr === value.attr) ){
					this.component.attributes[key].push(value);
				}
			});
		}
		// fix for arr_data function calling --> getting defaults
		if (this.component.attributes.attr_arr_data && this.component.attributes.attr_arr_data.length > 0) {
			for (let i = 0; i < this.component.attributes.attr_arr_data.length; i++) {
				this.component.attributes.attr_arr_data[i].defaults = this.createComponent.getValues(this.component.REF, this.component.attributes.attr_arr_data[i].attr);
			}
		}
	}

	// addjusting z-index to front
	public sendToFront() {
		this.getComponentData(this.componentID);
		const roomComponents = this.structure.getComponentContainer(this.container);
		for (let i = 0; i < roomComponents.length; i++) {
			if (this.component.ID !== roomComponents[i].ID) {
				roomComponents[i].position.zIndex = (roomComponents[i].position.zIndex === 1) ? 1 : (roomComponents[i].position.zIndex - 1);
				this.changeAttr(roomComponents[i].ID, 'zIndex', roomComponents[i].position.zIndex);
			}
		}
		this.component.position.zIndex = Math.max(...this.zIndexValues(this.component)) + 1;
		this.changeAttr(this.component.ID, 'zIndex', this.component.position.zIndex);
		this.saveComp();
	}

	// addjusting z-index to back
	public sendToBack() {
		this.getComponentData(this.componentID);
		const roomComponents = this.structure.getComponentContainer(this.container);
		for (let i = 0; i < roomComponents.length; i++) {
			if (this.component.ID !== roomComponents[i].ID) {
				roomComponents[i].position.zIndex = roomComponents[i].position.zIndex + 1;
				this.changeAttr(roomComponents[i].ID, 'zIndex', roomComponents[i].position.zIndex);
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
		const roomComponents = this.structure.getComponentContainer(this.container);
		const zIndex = [];
		for (let i = 0; i < roomComponents.length; i++) {
			if (roomComponents[i].ID !== comp.ID) {
				zIndex.push(roomComponents[i].position.zIndex);
			}
		}
		return zIndex;
	}

	public copyComp(){
		this.selectComponent.copyComponent( (this.component ? this.component.ID : false), this.container);
	}

	public pasteComp() {
		// paste component
		this.selectComponent.pasteComponent(this.container);
		// save config
		this.saveComp();
		this.selectComponent.removeContainerCopySelector(this.container, true);
	}

	// delete the selected component
	public compDelete() {
		this.selectComponent.removeComponent(this.component, this.container);
		this.saveComp();
	}

	public saveComponent() {
		// determine if component has multiple containers
		if (this.component.attributes.components && this.component.attributes.components[0] && this.component.attributes.components[0].components) {

			// data_pages is the unique way to define multiple container components
			let pages = parseInt(this.component.attributes.attr_data.find(x => x.attr === 'data_pages').value);
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
		this.createComponent.removeFhemComponent(this.componentList.selected);
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

	// select component details
	public toggleComponentDetails(){
		this.getComponentData(this.componentID);
		this.componentDetails.show = !this.componentDetails.show;
		if(this.componentDetails.show){
			let comp = this.structure.getComponent(this.componentID);
			let defaultComp = this.createComponent.fhemComponents.find(x=> x.name === comp.name);
			// component info
			this.componentDetails.component = {
				ID: this.componentID,
				name: comp.name,
			};
			// fhem userAttr info
			let attrValue = {long: '', short: ''};
			let giveText = (attr, key, val)=>{
				attrValue[attr] += val.attr.replace(key.replace('attr_', '')+'_', '') + ':' + ( Array.isArray(val.value) ? val.value[0] : val.value ) + ';';
			}
			for(const key of Object.keys(comp.attributes)){
				comp.attributes[key].forEach((val)=>{
					if(val.value !== ''){
						// long text with all definitions
						giveText('long', key, val);
						// short text with comparison to defaults
						if(
							(Array.isArray(val.value) ? val.value[0] : val.value) !== 
							(Array.isArray(defaultComp.component[val.attr]) ? defaultComp.component[val.attr][0] : defaultComp.component[val.attr])
						){
							giveText('short', key, val);
						}
					}
				});
			}
			this.componentDetails.fhem = {
				userAttr: 'FhemNative_'+comp.name.replace(' ', ''),
				value: attrValue
			};
			// room info
			this.componentDetails.room = {
				ID: this.structure.currentRoom.ID,
				UID: this.structure.currentRoom.UID,
				name: this.structure.currentRoom.name
			};
		}
	}

	// pin and unpin components
	// block movement
	public pinComponent(){
		let pinner = (item)=>{
			if(item.pinned){
				document.getElementById(item.ID).classList.add('pinned');
				this.selectComponent.removeCopySelector(item.ID);
			}else{
				document.getElementById(item.ID).classList.remove('pinned');
			}
		};
		// pin/unpin selected component
		let baseComp = this.structure.getComponent(this.componentID);
		if('pinned' in baseComp){
			baseComp.pinned = !baseComp.pinned;
		}else{
			baseComp['pinned'] = true;
		}
		pinner(baseComp);

		// assign pinning to all selected components
		this.selectComponent.selectorList.map(x=> x.ID).forEach((id)=>{
			let comp = this.structure.getComponent(id);
			comp['pinned'] = baseComp['pinned'];
			pinner(comp);
		});

		// detect grouping and modify pinning
		const isGrouped = this.selectComponent.isGrouped(baseComp.ID);
		if(isGrouped && !baseComp.pinned){
			this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group].forEach((id)=>{
				let comp = this.structure.getComponent(id);
				comp['pinned'] = baseComp['pinned'];
				pinner(comp);
			});
		}
	}

	// group/ungroup components
	public groupComponents(isGrouped){
		if(isGrouped){
			delete this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group];
		}else{
			// check for groups
			if(!this.structure.rooms[this.structure.currentRoom.ID]['groupComponents']){
				this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'] = {};
			}
			const groups = this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'];
			const lastKey = Object.keys(groups)[ Object.keys(groups).length - 1 ];
			// if groups are given, select last group integer + 1
			groups['group' +( lastKey ? ( parseInt(lastKey.match(/\d+/g)[0]) + 1 ) : 1 ) ] = this.selectComponent.selectorList.map(x=> x.ID);
		}
		// add to change stack
		this.undoManager.addChange();
	}

	ngOnDestroy(){
		// change mode
		this.settings.modeSub.next({showComponentConfig: false});
	}
}
