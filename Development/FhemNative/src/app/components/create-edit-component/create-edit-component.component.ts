import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';

// interfaces
import { FhemDevice, DynamicComponentDefinition } from '../../interfaces/interfaces.type';

// Components
import { ComponentsModule } from '../components.module';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { FhemService } from '../../services/fhem.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ComponentLoaderService } from '../../services/component-loader.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
	selector: 'create-edit-component',
	templateUrl: './create-edit-component.component.html',
  	styleUrls: ['./create-edit-component.component.scss']
})
export class CreateEditComponentComponent implements OnInit, OnDestroy {
	// get slides
	private slides: IonSlides;
  	@ViewChild('Slides', {static: false}) set content(content: IonSlides) {this.slides = content;}
  	// test container
  	private testContainer: ViewContainerRef;
  	@ViewChild('TESTCONTAINER', { static: false, read: ViewContainerRef }) set c(c: ViewContainerRef){this.testContainer = c;}

	// Inputs from creator
	// container to create menu
	@Input() container: any;
	// type (create/edit)
	@Input() type: string;
	// component ID for editing
	@Input() componentID: string;

	// show properties
	show: {[key: string]: boolean} = {
		picker: true,
		componentPreview: false
	};
	// component configuration test
	componentTest: any = {
		testDone: false
	}

	// component information
	component: DynamicComponentDefinition;

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
		public settings: SettingsService,
		private structure: StructureService,
		private logger: LoggerService,
		public componentLoader: ComponentLoaderService,
		private undoManager: UndoRedoService) {
	}

	ngOnInit(){
		if(this.type === 'edit'){
			// get component for edit state
			this.componentLoader.getFormattedComponent(this.componentID).then((component: DynamicComponentDefinition)=>{
				this.component = component;
				// push current settings to touch list
				this.addToTouched(component);
			});
			// get the component list of the current container
			this.componentList.components = this.structure.getComponentContainer(this.componentLoader.currentContainer);
			this.componentList.selected = this.componentID;
		}
	}

	// change the selected component
	changeSelectedComponent(ID: string): void{
		this.componentLoader.getFormattedComponent(ID).then((component: DynamicComponentDefinition)=>{
			this.component = component;
			// push current settings to touch list
			this.addToTouched(component);
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
	hideConfig(attr): boolean{
		if(this.component.dependencies && this.component.dependencies[attr]){
			let keys: string[] = Object.keys(this.component.attributes);
			// loop keys
			for(let i = 0; i < keys.length; i++){
				// check if attr depends on multiple variables
				if(Array.isArray(this.component.dependencies[attr].dependOn)){
					// loop dependOn
					for(let j = 0; j < this.component.dependencies[attr].dependOn.length; j++){
						const dependencyObject = this.component.attributes[keys[i]].find(x => x.attr === this.component.dependencies[attr].dependOn[j]);
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
					const dependencyObject = this.component.attributes[keys[i]].find(x => x.attr === this.component.dependencies[attr].dependOn);
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

	// test component device configuration
	private testComponentConfig(): Promise<any>{
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
					const device: string|null = this.component.attributes.attr_data.find(x=> x.attr === 'data_device').value;
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
							const sub: Subscription = this.fhem.deviceListSub.subscribe((next: FhemDevice[])=>{
								gotReply = true;
								sub.unsubscribe();
								if(next){
									this.componentTest.Device.present = true;
									this.testReading(next.find(x=> x.device === device));
									resolve();
								}
							});
							setTimeout(()=>{
								if(!gotReply){
									sub.unsubscribe();
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
				}else{
					// no data_device property --> test done
					this.testReading(null);
					resolve();
				}
			}else{
				this.testReading(null);
				resolve();
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

	// create component selection
	selectComponent(componentName: string): void{
		this.componentLoader.getFhemComponentData(componentName).then((component: DynamicComponentDefinition)=>{
			this.component = component;
			this.slides.slideNext();
		});
	}

	// test container config
	toggleTestContainer(state: boolean): void{
		this.testContainer.clear();
		this.settings.modes.componentTest = true;
		if(state && this.testContainer){
			// look for device
			this.testComponentConfig().then(()=>{
				this.componentLoader.addFhemComponent(this.component.name, this.testContainer).then((ref:any)=>{
					// load component info
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
					let w: number = window.innerWidth;
					let h: number = window.innerHeight * 0.8; // height of the picker

					let scale: number = Math.round((Math.min(w, h) - 100) / Math.max(this.component.dimensions.minX, this.component.dimensions.minY));
					if(scale > 10 ) scale = 10;

					ref.instance.width = scale * this.component.dimensions.minX + 'px';
					ref.instance.height = scale * this.component.dimensions.minY + 'px';
					ref.instance.zIndex = 1;
				});
			});
		}else{
			this.resetValues();
		}
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
				if(this.component.container && this.component.container === 'multi'){
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
					}
					if(diff > 0){
						// page size got smaller
						this.component.attributes.components.splice(
							this.component.attributes.components.length - (this.component.attributes.components.length - pages),
							this.component.attributes.components.length
						);
					}
				}
				// get components that should re reloaded
				let reloadComponents: DynamicComponentDefinition[] = [];
				this.touchedComponents.forEach((component: DynamicComponentDefinition)=>{
					this.componentLoader.removeDynamicComponent(component.ID);
					let comp = this.structure.getComponent(component.ID);
					reloadComponents.push(comp);
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
	cancel(){
		// restore components
		this.touchedComponents.forEach((component: DynamicComponentDefinition)=>{
			let comp = this.structure.getComponent(component.ID);
			comp.attributes = component.attributes;
			// logging
			this.logger.info('Component: ' + component.name + ', ID: '+ component.ID +' restored to unchanged');
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
	imports: [ComponentsModule, IonicModule, TranslateModule],
  	declarations: [CreateEditComponentComponent]
})
class CreateEditComponentComponentModule {}