import { Component, Input, OnInit, OnDestroy,ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonSlides } from '@ionic/angular';

import { FhemService } from '../../services/fhem.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { CreateComponentService } from '../../services/create-component.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
	selector: 'create-edit-component',
	template: `
		<picker
			*ngIf="type === 'create' || component"
			[height]="'85%'"
			[confirmBtn]="'GENERAL.BUTTONS.SAVE' | translate"
			(onConfirm)="saveComponent()"
			(onCancel)="cancel()"
			(onClose)="toggleTestContainer($event)"
			class="{{settings.app.theme}}"
			[class.small-header]="!component"
			[(ngModel)]="show.picker">
			<div class="header">
				<div class="preview-selector" *ngIf="component">
					<h2>{{ 'GENERAL.COMPONENT.GENERAL.CONFIG' | translate }} {{'COMPONENTS.'+[component.comp.name]+'.NAME' | translate}}</h2>
					<switch
						[customMode]="true"
						[(ngModel)]="show.componentPreview"
						[label]="'GENERAL.COMPONENT.EDIT.PREVIEW.TITLE' | translate"
						[subTitle]="'GENERAL.COMPONENT.EDIT.PREVIEW.INFO' | translate"
						(onToggle)="toggleTestContainer($event)"
						[padding]="true">
					</switch>
				</div>
				<h2 *ngIf="!component">{{ 'GENERAL.COMPONENT.GENERAL.SELECT' | translate }}</h2>
			</div>
			<div class="body">
				<div class="change-component" *ngIf="type === 'edit' && componentList.components?.length > 0">
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
				<ion-slides
					#Slides
					(ionSlideDidChange)="changedSlide()"
					[pager]="true">
					<ion-slide *ngIf="type === 'create'">
						<div class="page">
							<h2>{{ 'GENERAL.COMPONENT.CREATE.SELECT' | translate }}</h2>
							<ng-container *ngFor="let comp of createComponent.fhemComponents">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="component-select" (click)="selectComponent(comp)">
									<p class="component-name">{{ 'COMPONENTS.'+[comp.name]+'.NAME' | translate }}</p>
									<p class="component-des des">{{ 'COMPONENTS.'+[comp.name]+'.DES' | translate }}</p>
								</button>
							</ng-container>
						</div>
					</ion-slide>
					<ion-slide>
						<div class="page">
							<h2>{{ 'GENERAL.COMPONENT.EDIT.CONFIG_DATA' | translate }}</h2>
							<ng-template [ngIf]="component" [ngIfElse]="NO_COMP">
								<div class="config-container">
									<ng-container *ngIf="{ $implicit: component.comp.name, inputs: component.attributes.attr_data } as input">
										<ng-container *ngTemplateOutlet="COMP_INPUT; context: input"></ng-container>
									</ng-container>
									<div class="config-data toggle" *ngFor="let data of component.attributes.attr_bool_data">
										<switch
											[customMode]="true"
											[(ngModel)]="data.value"
											[label]="'COMPONENTS.'+[component.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate"
											[subTitle]="'COMPONENTS.'+[component.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate"
											[padding]="false">
										</switch>
									</div>
									<ng-container *ngIf="{ $implicit: component.comp.name, inputs: component.attributes.attr_arr_data } as input">
										<ng-container *ngTemplateOutlet="COMP_INPUT_SELECT; context: input"></ng-container>
									</ng-container>
								</div>
							</ng-template>
						</div>
					</ion-slide>
					<ion-slide *ngIf="component?.attributes.attr_icon || component?.attributes.attr_arr_icon">
						<div class="page">
							<h2>{{ 'GENERAL.COMPONENT.EDIT.CONFIG_ICON' | translate }}</h2>
							<div class="config-container">
								<ng-container *ngIf="{ 
										$implicit: component.comp.name, 
										inputs: component.attributes.attr_icon, 
										selection: settings.icons, 
										bind: 'icon' 
									} as input">
									<ng-container *ngTemplateOutlet="COMP_INPUT_SELECT; context: input"></ng-container>
								</ng-container>
								<ng-container *ngIf="{ 
										$implicit: component.comp.name, 
										inputs: component.attributes.attr_arr_icon, 
										selection: settings.icons, 
										bind: 'icon',
										multiple: true
									} as input">
									<ng-container *ngTemplateOutlet="COMP_INPUT_SELECT; context: input"></ng-container>
								</ng-container>
							</div>
						</div>
					</ion-slide>
					<ion-slide *ngIf="component?.attributes.attr_style || component?.attributes.attr_arr_style">
						<div class="page">
							<h2>{{ 'GENERAL.COMPONENT.EDIT.CONFIG_STYLE' | translate }}</h2>
							<div class="config-container">
								<ng-container *ngIf="{ 
										$implicit: component.comp.name, 
										inputs: component.attributes.attr_style, 
										selection: settings.componentColors, 
										tag: true,
										search: true,
										color: true
									} as input">
									<ng-container *ngTemplateOutlet="COMP_INPUT_SELECT; context: input"></ng-container>
								</ng-container>
								<ng-container *ngIf="{ 
										$implicit: component.comp.name, 
										inputs: component.attributes.attr_arr_style, 
										selection: settings.componentColors, 
										tag: true,
										search: true,
										color: true,
										multiple: true
									} as input">
									<ng-container *ngTemplateOutlet="COMP_INPUT_SELECT; context: input"></ng-container>
								</ng-container>
							</div>
						</div>
					</ion-slide>
					<ion-slide *ngIf="component?.comp.type === 'fhem'">
						<div class="page">
							<h2>{{ 'GENERAL.COMPONENT.EDIT.CONFIG_TEST' | translate }}</h2>
							<ng-template [ngIf]="componentTest.testDone" [ngIfElse]="LOADING">
								<div class="config-container device">
									<ng-container *ngFor="let test of ['Device', 'Reading']">
										<h3>{{test}}</h3>
										<div class="test-container" *ngFor="let testDetail of componentTest[test] | keyvalue">
											<p>{{test}} {{testDetail.key}}:</p>
											<ion-icon [class.check]="componentTest[test][testDetail.key]" [name]="componentTest[test][testDetail.key] ? 'checkmark-circle-outline' : 'close-circle-outline' "></ion-icon>
										</div>
									</ng-container>
								</div>
							</ng-template>
						</div>
					</ion-slide>
				</ion-slides>
			</div>
			<picker
				[height]="'100%'"
				[confirmBtn]="'GENERAL.BUTTONS.CLOSE' | translate"
				[showCancelBtn]="false"
				[(ngModel)]="show.componentPreview"
				(onClose)="toggleTestContainer($event)">
				<div class="page">
					<ng-container #TESTCONTAINER></ng-container>
					<ng-container *ngIf="!componentTest.testDone">
						<ng-container *ngTemplateOutlet="LOADING"></ng-container>
					</ng-container>
				</div>
			</picker>
		</picker>

		<ng-template #NAMING let-attr="attr" let-name>
			<p>{{ 'COMPONENTS.'+[name]+'.INPUTS.'+[attr]+'.name' | translate }}</p>
			<p class="des">{{ 'COMPONENTS.'+[name]+'.INPUTS.'+[attr]+'.info' | translate }}</p>
		</ng-template>

		<ng-template #COMP_INPUT let-inputs="inputs" let-name>
			<ng-container *ngIf="inputs">
				<div class="config-data" *ngFor="let data of inputs">
					<ng-container *ngTemplateOutlet="NAMING; context: {attr: data.attr, $implicit: name}"></ng-container>
					<input [(ngModel)]="data.value" placeholder="{{data.value}}">
			      	<span class="bar"></span>
				</div>
			</ng-container>
		</ng-template>

		<ng-template #COMP_INPUT_SELECT 
			let-inputs="inputs" 
			let-selection="selection" 
			let-bind="bind" 
			let-multiple="multiple" 
			let-search="search" 
			let-tag="tag" 
			let-color="color"
			let-name>
			<ng-container *ngIf="inputs">
				<div class="config-data" *ngFor="let data of inputs">
					<ng-container *ngTemplateOutlet="NAMING; context: {attr: data.attr, $implicit: name}"></ng-container>
					<ng-select 
						[items]="selection ? selection : data.value"
						[clearable]="false"
						[multiple]="multiple ? true : false"
						[searchable]="search ? true : false"
						[addTag]="tag ? true : false"
						[bindLabel]="bind ? bind : null"
						[bindValue]="bind ? bind : null"
						[placeholder]="bind ? data.value : null"
						[ngModel]="selection ? data.value : data.value[0]"
						(ngModelChange)="selection ? data.value = $event : data.value[0] = $event">
						<ng-template ng-option-tmp let-item="item" let-index="index">
							<ion-icon *ngIf="bind === 'icon' && item.type === 'ion'" [name]="item.icon"></ion-icon>
							<fa-icon *ngIf="bind === 'icon' && item.type != 'ion'" [icon]="item.icon"></fa-icon>
							<span *ngIf="color " class="color" [style.background]="item"></span>
							<span class="label" [class.color-label]="color">{{ ( bind === 'icon' ? item.icon : item ) }}</span>
						</ng-template>
					</ng-select>
				</div>
			</ng-container>
		</ng-template>

		<ng-template #NO_COMP>
			<div class="config-container">
				<p>{{ 'GENERAL.COMPONENT.EDIT.NO_COMPONENT' | translate }}</p>
			</div>
		</ng-template>

		<ng-template #LOADING>
			<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
		</ng-template>
	`,
	styleUrls: ['./create-edit-component-style.scss']
})
export class CreateEditComponentComponent implements OnInit, OnDestroy {
	// get slides
	private slides: IonSlides;
  	@ViewChild('Slides', {static: false}) set content(content: IonSlides) {
	    this.slides = content;
  	}
  	// test container
  	private testContainer: ViewContainerRef;
  	@ViewChild('TESTCONTAINER', { static: false, read: ViewContainerRef }) set c(c: ViewContainerRef){
  		this.testContainer = c;
  	}

	constructor(
		public fhem: FhemService,
		private structure: StructureService,
		public settings: SettingsService,
		public createComponent: CreateComponentService,
		private undoManager: UndoRedoService) {
	}
	// component Key
	static key = 'CreateEditComponentComponent';

	// Inputs from creator
	// container to create menu
	@Input() container: any;
	// type (create/edit)
	@Input() type: string;
	// component ID for editing
	@Input() componentID: string;

	// show properties
	public show: any = {
		picker: true,
		componentPreview: false
	};

	// component configuration test
	public componentTest: any = {
		testDone: false
	}
	// device list sub
	private devicesListSub: Subscription;

	// component information
	public component: any;

	// component list - jump between components for fast change
	public componentList: any = {
		components: [],
		selected: null
	};

	ngOnInit(){
		// change config
		this.settings.modeSub.next({showComponentConfig: true});
		if(this.type === 'edit'){
			// get component for edit state
			this.component = this.createComponent.getFormattedComponent(this.componentID);
			// get the component list
			this.componentList.components = this.structure.getComponentContainer(this.container);
			this.componentList.selected = this.componentID;
		}
	}

	// create component selection
	public selectComponent(comp){
		// transform component values
		this.component = {
			attributes: this.createComponent.seperateComponentValues(comp.component),
			comp: comp,
			REF: comp.REF,
			dimensions: comp.dimensions
		};
		// switch slide
		this.slides.slideNext();
	}

	public changeSelectedComponent(event){
		// update component based on selection
		this.component = this.createComponent.getFormattedComponent(this.componentList.selected);
		// check for test area
		this.changedSlide();
	}

	// change config slide
	public changedSlide(){
		this.slides.isEnd().then(end=>{
			if(end){
				this.testComponentConfig();
			}
		});
	}

	// test component device configuration
	private testComponentConfig(){
		return new Promise((resolve)=>{
			this.componentTest = {
				testDone: false,
				Device: {available: false, defined: false, present: false},
				Reading: {available: false,defined: false,present: false}
			};
			if(this.component && this.component.comp.type === 'fhem'){
				// test fhem device configuration
				if(this.component.attributes.attr_data && this.component.attributes.attr_data.find(x=> x.attr === 'data_device')){
					this.componentTest.Device.available = true;
					// check for filled device
					const device = this.component.attributes.attr_data.find(x=> x.attr === 'data_device').value;
					if(device && device !== ''){
						this.componentTest.Device.defined = true;
						// find device in fhem device list
						const foundDevice = this.fhem.devices.find(x=> x.device === device);
						if(foundDevice){
							this.componentTest.Device.present = true;
							this.testReading(foundDevice);
							resolve();
						}else{
							// send request
							let gotReply: boolean = false;
							this.devicesListSub = this.fhem.devicesListSub.subscribe(next=>{
								gotReply = true;
								this.devicesListSub.unsubscribe();
								if(next){
									this.componentTest.Device.present = true;
									this.testReading(next.find(x=> x.device === device));
									resolve();
								}
							});
							setTimeout(()=>{
								if(!gotReply){
									this.devicesListSub.unsubscribe();
									this.testReading(device);
									resolve();
								}
							}, 1000);
							this.fhem.listDevices(device);
						}
					}else{
						this.testReading(device);
						resolve();
					}
				}
			}else{
				resolve();
			}
		});
	}

	// test component reading configuration
	private testReading(device){
		const reading = this.component.attributes.attr_data.find(x=> x.attr === 'data_reading');
		if(reading){
			this.componentTest.Reading.available = true;
			if(reading.value && reading.value !== ''){
				this.componentTest.Reading.defined = true;
				if(device && device.readings && device.readings[reading.value]){
					this.componentTest.Reading.present = true;
					this.componentTest.testDone = true;
				}else{
					this.componentTest.testDone = true;
				}
			}else{
				this.componentTest.testDone = true;
			}
		}else{
			this.componentTest.testDone = true;
		}
	}

	// test container config
	public toggleTestContainer(state){
		this.testContainer.clear();
		this.settings.modes.componentTest = true;

		if(state && this.testContainer){
			// look for device
			this.testComponentConfig().then(()=>{
				// component ref
				let ref = this.createComponent.addFhemComponent(this.component.comp.name, this.testContainer);
				for (const [key, value] of Object.entries(this.component.attributes)) {
					if(this.component.attributes[key]){
						this.component.attributes[key].forEach((el)=>{
							ref.instance[el.attr] = el.value;
						});
					}
				}
				// assign test data
				ref.instance.ID = 'TEST_COMPONENT';
				ref.instance.top = '50%';
				ref.instance.left = '50%';
				// calculate container width
				setTimeout(()=>{
					let el = (document.querySelector('#TEST_COMPONENT') as HTMLElement);
					if(el){
						el.style.transform = 'translate(-50%, -50%)';
						let w = this.testContainer.element.nativeElement.parentNode.clientWidth;
						let h = this.testContainer.element.nativeElement.parentNode.clientHeight;

						// calc component scale
						let scale = (Math.min(w, h) - 100) / Math.max(this.component.dimensions.minX, this.component.dimensions.minY);
						if(scale > 10 ){scale = 10;}

						ref.instance.width = scale * this.component.dimensions.minX + 'px';
						ref.instance.height = scale * this.component.dimensions.minY + 'px';
					}
				}, 0);
			});
		}else{
			this.resetValues();
		}
	}

	// reset values
	private resetValues(){
		this.settings.modes.componentTest = false;
		this.show.componentPreview = false;
		if(this.testContainer){
			this.testContainer.clear();
		}
	}

	// save component
	public saveComponent(){
		if(this.component){
			if(this.type === 'create'){
				// define place for component
				const place = this.structure.getComponentContainer(this.container);
				// push comp
				this.createComponent.pushComponentToPlace(place, this.component);
				// adding the new component to the current view
				this.createComponent.loadRoomComponents([place[place.length - 1]], this.container, false);
			}
			if(this.type === 'edit'){
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
				this.createComponent.removeFhemComponent(this.componentList.selected);
				this.createComponent.loadRoomComponents([this.component], this.container, false);
			}
			// find new colors
			this.settings.findNewColors([this.component.attributes.attr_style, this.component.attributes.attr_arr_style]);
			// remove settings component
			this.createComponent.removeSingleComponent('CreateEditComponentComponent', this.createComponent.currentRoomContainer);
			// add to change stack
			this.undoManager.addChange();
			// reset values
			this.resetValues();
		}
	}

	// cancel whole config
	public cancel(){
		this.resetValues();
	}

	ngOnDestroy(){
		this.settings.modeSub.next({showComponentConfig: false});
	}
}