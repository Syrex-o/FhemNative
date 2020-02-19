import { Component, Input, OnInit, OnDestroy, ElementRef, HostListener, ViewChild } from '@angular/core';

import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';
import { SelectComponentService } from '../../services/select-component.service';
import { UndoRedoService } from '../../services/undo-redo.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'context-menu',
	template: `
		<div
			#CONTEXT_MENU
			class="context-menu {{settings.app.theme}}"
			[class.show]="show.contextMenu"
			[ngStyle]="{'left.px': x, 'top.px': y}">
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="toggleComponentSettings()" 
				class="select-item settings">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.SETTINGS' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="toggleComponentDetails()" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.DETAILS' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="pinComponent()" 
				class="select-item">
				{{ structure.getComponent(this.componentID)?.pinned ? ('GENERAL.EDIT_COMPONENT.MENU.UNPIN' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.PIN' | translate) }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="sendTo('front')" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.FOREGROUND' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component'" 
				(click)="sendTo('back')" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.BACKGROUND' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' && componentID"
				(click)="selectComponent.buildCopySelector(componentID, true, container)"
				class="select-item">
				{{ !selectComponent.evalCopySelector(componentID) ? ('GENERAL.EDIT_COMPONENT.MENU.SELECT' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.UNSELECT' | translate) }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'"
				(click)="!selectComponent.evalCopySelectorAll(container) ? selectComponent.buildCopySelectorAll(container) : selectComponent.removeContainerCopySelector(container, true)"
				class="select-item">
				{{ !selectComponent.evalCopySelectorAll(container) ? ('GENERAL.EDIT_COMPONENT.MENU.SELECT_ALL' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.DESELECT_ALL' | translate) }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' || (source !== 'component' && selectComponent.selectorList.length > 0)" 
				(click)="copyComp()" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.COPY' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' && componentID && selectComponent.selectorList.length > 1" 
				(click)="groupComponents(selectComponent.isGrouped(componentID))" 
				class="select-item">
				{{ !selectComponent.isGrouped(componentID) ? ('GENERAL.EDIT_COMPONENT.MENU.GROUP' | translate) : ('GENERAL.EDIT_COMPONENT.MENU.UNGROUP' | translate) }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="selectComponent.copyList.length > 0" 
				(click)="pasteComp()" 
				class="select-item">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.PASTE' | translate }}
			</button>
			<button matRipple 
				[matRippleColor]="'#d4d4d480'" 
				*ngIf="source === 'component' || (source !== 'component' && selectComponent.selectorList.length > 0)"
				(click)="compDelete()" 
				class="select-item delete top">
				{{ 'GENERAL.EDIT_COMPONENT.MENU.DELETE' | translate }}
			</button>
		</div>
		<picker
			*ngIf="componentID && show.componentDetails?.fhem"
			[height]="'65%'"
			[confirmBtn]="'GENERAL.BUTTONS.OKAY' | translate"
			[showCancelBtn]="false"
			[(ngModel)]="show.componentDetails.show">
			<div class="page padding {{settings.app.theme}}">
				<h2>{{ 'GENERAL.EDIT_COMPONENT.MENU.DETAILS' | translate }}: {{'COMPONENTS.'+[show.componentDetails.component.name]+'.NAME' | translate}}</h2>
				<div class="config-data">
					<p class="head">{{ 'GENERAL.DICTIONARY.COMPONENT' | translate }}:</p>
					<div class="details-row" *ngFor="let detail of show.componentDetails.component | keyvalue">
						<span class="key">{{detail.key}}:</span>
						<span class="value">{{detail.value}}</span>
					</div>
				</div>
				<div class="config-data">
					<p class="head">{{ 'GENERAL.DICTIONARY.ROOM' | translate }}:</p>
					<div class="details-row" *ngFor="let detail of show.componentDetails.room | keyvalue">
						<span class="key">{{detail.key}}:</span>
						<span class="value">{{detail.value}}</span>
					</div>
				</div>
				<div class="config-data">
					<p class="head">FhemNative userAttr Definition:</p>
					<div class="details-row">
						<span class="key">userAttr:</span>
						<span class="value">{{show.componentDetails.fhem.userAttr}}</span>
					</div>
					<p>{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.SHORT.TITLE' | translate }}</p>
					<p class="des">{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.SHORT.INFO' | translate }}</p>
					<p>{{show.componentDetails.fhem.value.short}}</p>

					<p>{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.LONG.TITLE' | translate }}</p>
					<p class="des">{{ 'GENERAL.EDIT_COMPONENT.MENU.DEF_DETAILS.LONG.INFO' | translate }}</p>
					<p>{{show.componentDetails.fhem.value.long}}</p>
				</div>
			</div>
		</picker>
	`,
	styles: [`
		.context-menu{
			user-select: none;
			position: fixed;
			z-index: 20004;
			margin: 0;
			padding: 0;
			min-width: 160px;
			max-width: 180px;
			min-height: 35px;
			list-style: none;
			background-color: #fff;
			border: 1px solid #ddd;
			border-radius: 4px;
			box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.4);
			text-align: center;
			opacity: 0;
			transition: all .2s ease;
		}
		.context-menu.show{
			opacity: 1;
		}
		button{
			font-weight: 500;
			line-height: 35px;
			padding: 0;
			position: relative;
			cursor: pointer;
			width: 100%;
			background: none;
			font-size: 13px;
		}
		button:focus{
			outline: 0px;
		}
		button.settings{
			color: var(--btn-blue) !important;
			border-bottom: 1px solid #ddd;
		}
		button.delete{
			color: var(--btn-red) !important;
			border-top: 1px solid #ddd;
		}
		.page{
			padding: 10px;
		}
		.head{
			font-size: 1.2em;
		}
		.key,
		.value{
		    width: 150px;
		    display: inline-block;
		}
		.context-menu.dark{
			background: var(--dark-bg);
		}
		.config-data p{
			margin-bottom: 15px;
		}
		.config-data p.des{
			color: var(--p-small) !important;
			font-size: .8em;
			margin-top: -10px;
		}
		.dark button,
		.dark span.key,
		.dark span.value,
		.dark h2,
		.dark .head,
		.dark p{
			color: var(--dark-p);
		}
	`]
})
export class ContextMenuComponent implements OnInit{
	@ViewChild('CONTEXT_MENU', { static: false, read: ElementRef }) contextMenu: ElementRef;

	constructor(
		public structure: StructureService,
		public settings: SettingsService,
		private ref: ElementRef,
		private createComponent: CreateComponentService,
		public selectComponent: SelectComponentService,
		private undoManager: UndoRedoService,
		private translate: TranslateService) {
	}

	// component Key
	static key = 'ContextMenuComponent';
	// Inputs
	@Input() x: number;
	@Input() y: number;
	// The source from the injector
	// identify if double click on grod or component
	// used for identification of copy and paste methods
	@Input() source: string;
	// The container of the component
	@Input() container;
	// The component ID from double click selection
	@Input() componentID;
	// show attr
	public show: any = {
		contextMenu: false,
		componentDetails: {
			show: false
		}
	}

	// remove component on outside click
	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target'])
	onClick(target) {
		if (!this.ref.nativeElement.contains(target)) {
			// remove menu
			this.createComponent.removeSingleComponent('ContextMenuComponent', this.createComponent.currentRoomContainer);
		}
	}


	ngOnInit(){
		setTimeout(() => {
			this.calcPosition();

		}, 0);
	}

	// calc menu position
	private calcPosition(){
		const menu = this.contextMenu.nativeElement;
		const container = this.container.element.nativeElement.parentNode.getBoundingClientRect();
		let x = 0; let y = 0;
		if (this.x + menu.clientWidth >= container.width) {
			x = -100;
		}
		if (this.y + menu.clientHeight >= container.height) {
			y = -100;
		}
		menu.style.transform = 'translate3d(' + x + '%,' + y + '%, 0)';
		this.show.contextMenu = true;
	}

	// toggle component settings
	public toggleComponentSettings(){
		this.createComponent.createSingleComponent('CreateEditComponentComponent', this.container, {
			container: this.container,
			type: 'edit',
			componentID: this.componentID
		});
	}

	// toggle component details
	public toggleComponentDetails(){
		// get component
		const component = this.createComponent.getFormattedComponent(this.componentID);
		// toggle menu
		this.show.componentDetails.show = !this.show.componentDetails.show;
		if(this.show.componentDetails.show){
			// component info
			this.show.componentDetails.component = {
				ID: this.componentID,
				name: component.name
			}
			// fhem userAttr info
			let attrValue = {long: '', short: ''};
			let giveText = (attr, key, val)=>{
				attrValue[attr] += val.attr.replace(key.replace('attr_', '')+'_', '') + ':' + ( Array.isArray(val.value) ? val.value[0] : val.value ) + ';';
			}
			let defaultComp = this.createComponent.fhemComponents.find(x=> x.name === component.name);

			for(const key of Object.keys(component.attributes)){
				component.attributes[key].forEach((val)=>{
					if(val.value !== '' && val.attr !== 'data_device'){
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
			this.show.componentDetails.fhem = {
				userAttr: 'FhemNative_'+component.name.replace(' ', ''),
				value: attrValue
			};
			// room info
			this.show.componentDetails.room = {
				ID: this.structure.currentRoom.ID,
				UID: this.structure.currentRoom.UID,
				name: this.structure.currentRoom.name
			};
		}
	}

	// pin/unpin components
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

	// send component to from/back
	public sendTo(param){
		const component = this.createComponent.getFormattedComponent(this.componentID);
		const roomComponents = this.structure.getComponentContainer(this.container);
		const zIndex = [];
		for (let i = 0; i < roomComponents.length; i++) {
			if (this.componentID !== roomComponents[i].ID) {
				roomComponents[i].position.zIndex = param === 'back' ? 
					(roomComponents[i].position.zIndex + 1) : 
					( (roomComponents[i].position.zIndex === 1) ? 1 : (roomComponents[i].position.zIndex - 1) );
				this.changeAttr('zIndex', roomComponents[i].position.zIndex);
				// add to zindex arr
				zIndex.push(roomComponents[i].position.zIndex);
			}
		}
		component.position.zIndex = param === 'front' ? ( Math.max(...zIndex) + 1 ) : 1;
		this.changeAttr('zIndex', component.position.zIndex);
		this.saveComp();
	}

	// change component attribute
	private changeAttr(attr, value) {
		const elem = this.createComponent.findFhemComponent(this.componentID);
		if (elem) {
			elem.item.instance[attr] = value;
		}
	}

	// copy component
	public copyComp(){
		this.selectComponent.copyComponent( (this.componentID ? this.componentID : false), this.container);
	}

	// paste component
	public pasteComp(){
		// paste component
		this.selectComponent.pasteComponent(this.container);
		// save config
		this.saveComp();
		this.selectComponent.removeContainerCopySelector(this.container, true);
	}

	// delete component
	public compDelete(){
		const component = this.structure.getComponent(this.componentID);
		this.selectComponent.removeComponent(component, this.container);
		this.saveComp();
	}

	// group components
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

	// saving rooms
	private saveComp() {
		// removing the editor
		this.createComponent.removeSingleComponent('ContextMenuComponent', this.createComponent.currentRoomContainer);
		// add to change stack
		this.undoManager.addChange();
	}
}