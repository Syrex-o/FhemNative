import { Component, Input, NgModule, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IconModule } from '../icon/icon.component';
import { NewsSlideModule } from '../../directives/news-slide.directive';
import { SelectComponentModule } from '../select/select.component';
import { SwitchComponentModule } from '../switch/switch.component';
import { PickerComponentModule } from '../picker/picker.component';

// interfaces
import { FhemDevice, DynamicComponentDefinition } from '../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { StructureService } from '../../services/structure.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

@Component({
	selector: 'create-edit-component',
	templateUrl: './create-edit-component.component.html',
	styleUrls: ['./create-edit-component.component.scss']
})
export class CreateEditComponentComponent implements OnInit, AfterViewInit, OnDestroy {
	// get slides
	private slides!: IonSlides;
	@ViewChild('Slides', {static: false}) set content(content: IonSlides) {this.slides = content;}
	// test container
	private testContainer!: ViewContainerRef;
	@ViewChild('TESTCONTAINER', { static: false, read: ViewContainerRef }) set c(c: ViewContainerRef){this.testContainer = c;}

	// Inputs from creator
	// container to create menu
	@Input() container: any;
	// type (create/edit)
	@Input() type!: string;
	// component ID for editing
	@Input() componentID!: string;

	// show properties
	show: {[key: string]: boolean} = {
		picker: true,
		componentPreview: false
	};
	// component configuration test
	componentTest: any = {
		testDone: false,
		Device: {available: false, defined: false, present: false},
		Reading: {available: false,defined: false,present: false}
	}
	// component information
	component!: DynamicComponentDefinition;
	// component list - jump between components for fast change
	componentList: {components: DynamicComponentDefinition[], selected: null|string} = {
		components: [],
		selected: null
	};
	// list of touched components
	// used to revert to last state, when cancel pressed
	private touchedComponents: DynamicComponentDefinition[] = [];

	constructor(
		private fhem: FhemService,
		private logger: LoggerService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		public componentLoader: ComponentLoaderService) {}

	ngOnInit(){
		if(this.type === 'edit'){
			// get component for edit state
			this.componentLoader.getFormattedComponent(this.componentID).then((component: DynamicComponentDefinition)=>{
				this.component = component;
				// push current settings to touch list
				this.addToTouched(component);
			});
			// get the component list of the current container
			let containerComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(this.componentLoader.currentContainer);;
			if(containerComponents){
				this.componentList.components = containerComponents;
				this.componentList.selected = this.componentID;
			}
		}
	}

	ngAfterViewInit(){
		this.checkForSlideLock();
	}

	private checkForSlideLock(): void{
		if(this.settings.operatingPlatform === 'desktop'){
			this.slides.lockSwipes(true);
		}
	}

	// create component selection
	selectComponent(componentName: string): void{
		this.componentLoader.getFhemComponentData(componentName).then((component: DynamicComponentDefinition)=>{
			this.component = component;
			// change slide
			this.slides.lockSwipes(false);
			this.slides.slideNext();
			this.checkForSlideLock();
			this.updateSlideIndex();
		});
	}

	// change the selected component
	changeSelectedComponent(ID: string): void{
		this.componentLoader.getFormattedComponent(ID).then((component: DynamicComponentDefinition)=>{
			this.component = component;
			// push current settings to touch list
			this.addToTouched(component);
			// change slide
			this.changedSlide();
		});
	}

	// add to touched components
	private addToTouched(component: DynamicComponentDefinition){
		if(this.touchedComponents.length === 0 || !this.touchedComponents.find(x=> x.ID === component.ID)){
			this.touchedComponents.push(JSON.parse(JSON.stringify(component)));
		}
	}

	// determine if config part should be hidden due to dependencies
	hideConfig(attr: string): boolean{
		if(this.component.dependencies && this.component.dependencies[attr]){
			let componentAttributes: any = this.component.attributes;
			let componentDependencies: any = this.component.dependencies;
			let keys: string[] = Object.keys(this.component.attributes);
			// loop keys
			for(let i = 0; i < keys.length; i++){
				// check if attr depends on multiple variables
				if(Array.isArray(this.component.dependencies[attr].dependOn)){
					// loop dependOn
					for(let j = 0; j < this.component.dependencies[attr].dependOn.length; j++){
						const dependencyObject = componentAttributes[keys[i]].find((x: any) => x.attr === componentDependencies[attr].dependOn[j]);
						if(dependencyObject){
							// determine if depency array values position 0 is array
							const compare = Array.isArray(dependencyObject.value) ? dependencyObject.value[0] : dependencyObject.value;
							// determine if dependency value is array
							const value: any = this.component.dependencies[attr].value;
							// loop values
							// in cases of multi dependencies, the value object MUST be an Array representing length of dependency variables
							// can be Array of Arrays in cases of multi dependencies
							for(let k = 0; k < value.length; k++){
								if(Array.isArray(value[k])){
									if(!value[k].includes(compare)){
										// trigger hide
										return true;
									}
								}else{
									// not nested
									if(value[k] !== compare){
										return true;
									}
								}
							}
						}
					}
				}else{
					// single dependency variables
					const dependencyObject = componentAttributes[keys[i]].find((x: any) => x.attr === componentDependencies[attr].dependOn);
					if(dependencyObject){
						// determine array values position 0, if array
						const compare = Array.isArray(dependencyObject.value) ? dependencyObject.value[0] : dependencyObject.value;
						// determine if dependency value is array
						const value: any = this.component.dependencies[attr].value;
						if(Array.isArray(value)){
							if(!value.includes(compare)){
								return true;
							}
						}else{
							if(value !== compare){
								return true;
							}
						}
					}
				}
			}
		}
		// should not hide
		return false;
	}

	// change config slide
	changedSlide(): void{
		this.slides.isEnd().then(end=>{
			if(end && this.component){
				this.testComponentConfig();
			}
		});
	}

	// buttons from desktop
	changeSlide(dir: number): void{
		this.slides.lockSwipes(false);
		if(dir === 1){
			this.slides.slideNext();
		}else{
			this.slides.slidePrev();
		}
		this.slides.lockSwipes(true);
		this.updateSlideIndex();
	}

	// update slide index
	currentSlide: number = 0;
	totalSlides: number = 0;
	private updateSlideIndex(): void{
		this.slides.getActiveIndex().then((val: number)=>{
			this.currentSlide = val;
		});
		setTimeout(()=>{
			this.slides.length().then((val: number)=>{
				this.totalSlides = val;
			});
		}, 20);
	}

	// test component device configuration
	private testComponentConfig(): Promise<boolean>{
		return new Promise((resolve)=>{
			// test params
			this.componentTest = {
				testDone: false,
				Device: {available: false, defined: false, present: false},
				Reading: {available: false,defined: false,present: false}
			};
			if(this.component && this.component.type === 'fhem'){
				// test fhem device configuration
				if(this.component.attributes.attr_data && this.component.attributes.attr_data.find(x=> x.attr === 'data_device')){
					this.componentTest.Device.available = true;
					// check for filled device
					const deviceAttr = this.component.attributes.attr_data.find(x=> x.attr === 'data_device');
					if(deviceAttr){
						const device: string|null = deviceAttr.value;
						if(device && device !== ''){
							this.componentTest.Device.defined = true;
							// find device in fhem device list
							const foundDevice = this.fhem.devices.find(x=> x.device === device);
							if(foundDevice){
								this.componentTest.Device.present = true;
								this.testReading(foundDevice);
								resolve(true);
							}else{
								// send request
								let gotReply: boolean = false;
								const sub: Subscription = this.fhem.deviceListSub.subscribe((next: FhemDevice[])=>{
									gotReply = true;
									sub.unsubscribe();
									if(next){
										this.componentTest.Device.present = true;
										this.testReading(next.find(x=> x.device === device));
										resolve(true);
									}
								});
								setTimeout(()=>{
									if(!gotReply){
										sub.unsubscribe();
										this.testReading(device);
										resolve(true);
									}
								}, 1000);
								this.fhem.listDevices(device);
							}
						}else{
							this.testReading(device);
							resolve(true);
						}
					}else{
						// no data_device property --> test done
						this.testReading(null);
						resolve(true);
					}
				}else{
					// no data_device property --> test done
					this.testReading(null);
					resolve(true);
				}
			}else{
				this.testReading(null);
				resolve(true);
			}
		});
	}

	// test component reading configuration
	private testReading(device: any): void{
		if(this.component.attributes.attr_data){
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
		}else{
			this.componentTest.testDone = true;
		}
	}

	// test container config
	toggleTestContainer(state: boolean): void{
		this.testContainer.clear();
		this.settings.modes.componentTest = true;
		let componentAttributes: any = this.component.attributes;
		if(state && this.testContainer){
			// look for device
			this.testComponentConfig().then(()=>{
				this.componentLoader.addFhemComponent(this.component.name, this.testContainer).then((ref:any)=>{
					// load component info
					for (const [key, value] of Object.entries(this.component.attributes)) {
						if(componentAttributes[key]){
							componentAttributes[key].forEach((el: any)=>{
								ref.instance[el.attr] = el.value;
							});
						}
					}
					// assign test data
					ref.instance.ID = 'TEST_COMPONENT';
					ref.instance.top = '50%';
					ref.instance.left = '50%';
					// calculate container width
					let w: number = window.innerWidth;
					let h: number = window.innerHeight * 0.8; // height of the picker

					if(this.component.dimensions){
						let scale: number = Math.round((Math.min(w, h) - 100) / Math.max(this.component.dimensions.minX, this.component.dimensions.minY));
						if(scale > 10 ) scale = 10;

						ref.instance.width = scale * this.component.dimensions.minX + 'px';
						ref.instance.height = scale * this.component.dimensions.minY + 'px';
						ref.instance.zIndex = 1;
					}
				});
			});
		}else{
			this.resetValues();
		}
	}

	// used to trigger picker close animation, while using buttons in desktop mode
	saveComponentFromDesktop(): void{
		this.show.picker = false;
		this.saveComponent();
	}

	// save the component config
	saveComponent(): void{
		if(this.component){
			if(this.type === 'create'){
				// define place for component
				const place = this.structure.getComponentContainer(this.container);
				if(place){
					this.componentLoader.pushComponentToPlace(place, this.component);
					// adding the new component to the current view
					this.componentLoader.loadRoomComponents([place[place.length - 1]], this.container, false);
					// logging
					this.logger.info('Component: ' + this.component.name + ' created');
				}
			}
			if(this.type === 'edit'){
				// determine if component has multiple containers
				if(this.component.container && this.component.container === 'multi' && this.component.attributes.attr_data){
					let pageAttr = this.component.attributes.attr_data.find(x => x.attr === 'data_pages');
					if(pageAttr){
						// data_pages is the unique way to define multiple container components
						let pages = parseInt(pageAttr.value);
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
						}
						if(diff > 0){
							// page size got smaller
							this.component.attributes.components.splice(
								this.component.attributes.components.length - (this.component.attributes.components.length - pages),
								this.component.attributes.components.length
							);
						}
					}
				}
				// get components that should re reloaded
				let reloadComponents: DynamicComponentDefinition[] = [];
				this.touchedComponents.forEach((component: DynamicComponentDefinition)=>{
					this.componentLoader.removeDynamicComponent(component.ID as string);
					let comp = this.structure.getComponent(component.ID as string);
					if(comp){
						reloadComponents.push(comp);
					}
					// logging
					this.logger.info('Component: ' + component.name + ', ID: '+ component.ID +' modified');
				});
				this.componentLoader.loadRoomComponents(reloadComponents, this.componentLoader.currentContainer, false);
			}
			// find new colors
			this.settings.findNewColors([this.component.attributes.attr_style, this.component.attributes.attr_arr_style]);
			// remove menu component
			this.removeMenu();
			// add to change stack
			this.undoManager.addChange();
			// reset values
			this.resetValues();
		}
	}

	// cancel changes or creation
	cancel(): void{
		// restore components
		this.touchedComponents.forEach((component: DynamicComponentDefinition)=>{
			let comp = this.structure.getComponent(component.ID as string);
			if(comp){
				comp.attributes = component.attributes;
				// logging
				this.logger.info('Component: ' + component.name + ', ID: '+ component.ID +' restored to unchanged');
			}
		});

		// remove menu component
		this.removeMenu();
		// reset values
		this.resetValues();
	}

	// remove component
	private removeMenu(): void{
		setTimeout(()=>{
			this.componentLoader.removeDynamicComponent('CreateEditComponent');
		}, 300);
	}

	// reset values
	private resetValues(): void{
		this.settings.modes.componentTest = false;
		this.show.componentPreview = false;
		if(this.testContainer){
			this.testContainer.clear();
		}
	}

	ngOnDestroy(){
		this.resetValues();
	}
}
@NgModule({
	imports: [
		IconModule,
		IonicModule,
		FormsModule,
		CommonModule,
		NewsSlideModule,
		TranslateModule,
		SelectComponentModule,
		PickerComponentModule,
		SwitchComponentModule
	],
	declarations: [CreateEditComponentComponent]
})
class CreateEditComponentComponentModule {}