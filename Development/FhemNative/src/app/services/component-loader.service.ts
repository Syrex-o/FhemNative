import { Injectable, Injector, ComponentFactoryResolver, NgModuleFactory, Type } from '@angular/core';
import { Subject } from 'rxjs';

// interfaces
import { 
	DynamicComponentDefinition,
	ComponentAttributes,
	ComponentSettings, 
	CustomComponentInputs, 
	DynamicComponent,
	ComponentInStructure,
	Room
} from '../interfaces/interfaces.type';

// Services
import { LoggerService } from './logger/logger.service';
import { StructureService } from './structure.service';
import { VariableService } from './variable.service';

interface ContainerSub {
	ID: string|number,
	action?: string,
	container?: any
}

@Injectable({providedIn: 'root'})

export class ComponentLoaderService {
	// list of standard Components
	private standardComponents: DynamicComponent[] = [
		{name: 'ContextMenuComponent', path: 'context-menu/context-menu'},
		{name: 'CreateEditComponent', path: 'create-edit-component/create-edit-component'},
		{name: 'CreateEditRoomComponent', path: 'create-edit-room/create-edit-room'},
		{name: 'GridComponent', path: 'grid/grid'},
		{name: 'SelectRectangleComponent', path: 'select-rectangle/select-rectangle'},
		// Pages
		{name: 'SettingsComponent', path: 'settings/settings'},
		{name: 'TasksComponent', path: 'tasks/tasks'},
		{name: 'VariablesComponent', path: 'variables/variables'},
		// Loader
		{name: 'LoaderComponent', path: 'loader/loader'},
	];

	// list of dynammic fhem Components
	public fhemComponents: DynamicComponent[] = [
		{name: 'Box', path: 'fhem-box/fhem-box'},
		{name: 'Button', path: 'fhem-button/fhem-button'},
		{name: 'Button Menu', path: 'fhem-button-menu/fhem-button-menu'},
		{name: 'Button Multistate', path: 'fhem-button-multistate/fhem-button-multistate'},
		{name: 'Chart', path: 'fhem-chart/fhem-chart'},
		{name: 'Circle Menu', path: 'fhem-circle-menu/fhem-circle-menu'},
		{name: 'Circle Slider', path: 'fhem-circle-slider/fhem-circle-slider'},
		{name: 'Clock', path: 'fhem-clock/fhem-clock'},
		{name: 'Color Picker', path: 'fhem-color-picker/fhem-color-picker'},
		{name: 'Html', path: 'fhem-html/fhem-html'},
		{name: 'Icon', path: 'fhem-icon/fhem-icon'},
		{name: 'IFrame', path: 'fhem-iframe/fhem-iframe'},
		{name: 'Input', path: 'fhem-input/fhem-input'},
		{name: 'Image', path: 'fhem-image/fhem-image'},
		{name: 'Label', path: 'fhem-label/fhem-label'},
		{name: 'Line', path: 'fhem-line/fhem-line'},
		{name: 'MediaList', path: 'fhem-medialist/fhem-medialist'},
		{name: 'Picker', path: 'fhem-picker/fhem-picker'},
		{name: 'Pinpad', path: 'fhem-pinpad/fhem-pinpad'},
		{name: 'Popup', path: 'fhem-popup/fhem-popup'},
		{name: 'Select', path: 'fhem-select/fhem-select'},
		{name: 'Slider', path: 'fhem-slider/fhem-slider'},
		{name: 'Sprinkler', path: 'fhem-sprinkler/fhem-sprinkler'},
		{name: 'Swiper', path: 'fhem-swiper/fhem-swiper'},
		{name: 'Switch', path: 'fhem-switch/fhem-switch'},
		{name: 'Table', path: 'fhem-table/fhem-table'},
		{name: 'Tabs', path: 'fhem-tabs/fhem-tabs'},
		{name: 'Thermostat', path: 'fhem-thermostat/fhem-thermostat'},
		{name: 'Time Picker', path: 'fhem-timepicker/fhem-timepicker'},
		{name: 'Weather', path: 'fhem-weather/fhem-weather'}
	];

	// list of components that were added to the view
	public containerComponents: Array<any> = [];

	// the current container
	// container to place components
	public currentContainer: any;
	// container stack, to revert to last container
	public containerStack: Array<ContainerSub> = [];
	// subject of the container stack evaluation
	public currentContainerSub = new Subject<any>();

	constructor(
		private logger: LoggerService,
		private injector: Injector,
		private resolver: ComponentFactoryResolver,
		private structure: StructureService,
		private variable: VariableService){
		// container subscriptions
		this.currentContainerSub.subscribe((next: ContainerSub)=>{
			// check for initial --> must be room
			if(next.action === 'initial'){
				this.containerStack = [{ID: next.ID, container: next.container}];
				this.currentContainer = next.container;
			}
			if(next.action === 'add'){
				this.containerStack.push({ID: next.ID, container: next.container});
				this.currentContainer = next.container;
			}
			if(next.action === 'remove'){
				const index = this.containerStack.findIndex(x => x.ID === next.ID);
				if(index > -1){
					this.containerStack.splice(index, 1);
					this.currentContainer = this.containerStack[this.containerStack.length -1].container;
				}
			}
		});

		// variable updates
		this.variable.variableUpdate.subscribe((variable)=>{
			if(this.containerComponents.length > 0){
				// get current room components
				const allComponents: any = this.structure.getAllComponents();
				let filteredComponents: any = allComponents.filter(x=> x.roomID === this.structure.currentRoom.UID).map(x=> x.component);
				if(filteredComponents.length > 0){
					// make copy
					filteredComponents = JSON.parse(JSON.stringify(filteredComponents));
					// list of components to reload
					let reloadComponents = this.getModifiedComponents(filteredComponents).filter(x=> x.modified);
					if(reloadComponents.length > 0){
						// reload the modified components (respect their container)
						reloadComponents.forEach((modComponent)=>{
							if(modComponent.modified){
								const componentInContainer = this.containerComponents.find(x=> x.ID === modComponent.component.ID);
								if(componentInContainer){
									// remove and reload (from current container information)
									this.removeDynamicComponent(modComponent.component.ID);
									this.loadRoomComponents([modComponent.component], componentInContainer.container, false);
								}
							}
						});
					}
				}
			}
		});
	}

	// load a dynamic component
	// determine if fhem component or standard component
	public loadDynamicComponent(path: string, fhemComponent: boolean): Promise<Type<any>>{
		return new Promise((resolve)=>{
			const prefix: string = fhemComponent ? 'components/fhem-components/' : 'components/';
			import(`../${ prefix + path}.component`).then((componentData: any)=>{
				const comp: string = Object.keys(componentData)[0];
				const ComponentType: Type<any> = componentData[comp];
				resolve(ComponentType);
			});
		});
	}

	// get the component information --> needs to load the component 
	public getFhemComponentData(name: string): Promise<DynamicComponentDefinition>{
		return new Promise((resolve)=>{
			const fhemComponent: DynamicComponent = this.fhemComponents.find(x => x.name === name);
			this.loadDynamicComponent(fhemComponent.path, true).then((ComponentType: any)=>{
				const comp: ComponentSettings = ComponentType.getSettings();

				const res: DynamicComponentDefinition = {
					name: comp.name,
					attributes: this.seperateComponentValues(this.arrange(comp.inputs)),
					type: comp.type,
					dimensions: comp.dimensions
				}
				// check dependencies
				if(comp.dependencies){
					res.dependencies = comp.dependencies;
				}
				// check for container
				if(comp.container){
					res.container = comp.container;
				}
				// check for custom inputs
				// add a reminder for user
				if(comp.customInputs){
					res.customInputs = comp.customInputs;
				}
				resolve(res);
			});
		});
	}

	// get the component custom input data and assign to ref
	public assignCustomInputData(ID: string, name: string): Promise<CustomComponentInputs>{
		return new Promise((resolve)=>{
			const structureComponent = this.structure.getComponent(ID);
			const component = this.containerComponents.find(x => x.ID === ID);
			if(structureComponent && component){
				if(structureComponent.customInputs){
					// assign the custom inputs
					for (const [key, value] of Object.entries(structureComponent.customInputs)) {
						component.REF.instance[key] = value;
					}
					resolve(structureComponent.customInputs);
				}else{
					this.getFhemComponentData(name).then((componentData: DynamicComponentDefinition)=>{
						for (const [key, value] of Object.entries(componentData.customInputs)) {
							component.REF.instance[key] = value;
						}
						resolve(componentData.customInputs);
					});
				}
			}
		});
	}

	// get a formatted fhem component
	// new values + already defined values
	// component can be passed directly as input --> no structure call needed
	public getFormattedComponent(ID: string, componentInput?: any): Promise<DynamicComponentDefinition>{
		return new Promise((resolve)=>{
			// get the component
			const component: DynamicComponentDefinition = componentInput ? componentInput : this.structure.getComponent(ID);
			// cache component attributes
			const cacheAttributes: ComponentAttributes = JSON.parse(JSON.stringify(component.attributes));
			// get component defaults
			this.getFhemComponentData(component.name).then((compData: DynamicComponentDefinition)=>{
				const componentDefaults = compData;
				// remove all attributes
				// used to create sorting and to reduce number of loops --> no attr delete loop needed
				component.attributes = {};
				// look for new props in component
				for(const key of Object.keys(componentDefaults.attributes)){
					// append default values
					component.attributes[key] = componentDefaults.attributes[key];
					// append modiefied values (differing from default)
					if(cacheAttributes[key]){
						// loop key
						cacheAttributes[key].forEach(cacheAttr=>{
							let foundIndex: number = component.attributes[key].findIndex(x=> x.attr === cacheAttr.attr);
							if(foundIndex > -1){
								// create empty obj first --> prevent overwrite
								let obj = {};
								// check for default array values
								// default values are only present in attr_arr_data
								if(key === 'attr_arr_data'){
									obj['defaults'] = component.attributes[key][foundIndex].value;
								}
								// append values
								obj['attr'] = cacheAttr.attr;
								obj['value'] = cacheAttr.value;
								// component.attributes[key][foundIndex] = cacheAttr;
								component.attributes[key][foundIndex] = obj;
							}
						});
					}
				}
				// append nested components if needed
				if('components' in cacheAttributes){
					component.attributes.components = cacheAttributes.components;
				}
				// assign tyle and dimensions
				component['type'] = componentDefaults.type;
				component['dimensions'] = componentDefaults.dimensions;
				// check dependencies
				if(componentDefaults.dependencies){
					component.dependencies = componentDefaults.dependencies;
				}
				// check for container
				if(componentDefaults.container){
					component.container = componentDefaults.container;
				}
				resolve(component);
			});
		});
	}

	// arrange component inputs
	private arrange(item: Array<any>): Array<any> {
		const data = [];
		for (let i = 0; i < item.length; i++) {
			if (item[i].variable.substr(0, 8) !== 'arr_data') {
				data[item[i].variable] = item[i].default;
			} else {
				data[item[i].variable] = item[i].default.replace(/\s/g, '').split(',');
			}
		}
		return data;
	}

	// check if variables are loaded
	private variablesLoaded(): Promise<any>{
		return new Promise((resolve)=>{
			if(this.variable.variablesLoaded){
				resolve();
			}else{
				let gotReply: boolean = false;
				const sub = this.variable.variablesLoadedSub.subscribe(state=>{
					if(state){
						gotReply = true;
						sub.unsubscribe();
						resolve();
					}
				});
				setTimeout(()=>{
					if(!gotReply){
						sub.unsubscribe();
						resolve();
					}
				}, 1000);
			}
		});
	}

	// get modified list of components to load
	private getModifiedComponents(components: Array<any>): Array<{component: any, modified: boolean}>{
		// list of components with modified mark
		let modifiedComponents: Array<{component: any, modified: boolean}> = [];

		if(this.variable.variables.length > 0){
			// create copy to prevent change saving
			components = JSON.parse(JSON.stringify(components));
			components.forEach((component)=>{
				let modified: boolean = false;
				// loop attributes
				for (const key of Object.keys(component.attributes)) {
					component.attributes[key].forEach((attribute)=>{
						// skip special snytax for fixed variable values (Exp. data_fixed_var_...)
						// check if attribute is avaible for component containers
						let foundVar = this.variable.variables.find(x=> attribute.attr && attribute.attr.indexOf('fixed_var') === -1 && attribute.value === x.defSyntax);
						if(foundVar && foundVar.modValue !== undefined){
							// modify component
							attribute.value = foundVar.modValue;
							modified = true;
						}
					});
				}
				modifiedComponents.push({
					component: component,
					modified: modified
				});
			});
		}else{
			components.forEach((component)=>{
				modifiedComponents.push({
					component: component,
					modified: false
				});
			});
		}
		return modifiedComponents
	}

	// load relevant components for the room/container component
	// clearAll: container cleared
	// clearPartially: just container (not storage)
	public loadRoomComponents(components: Array<any>, container: any, clearAll: boolean, clearPartially?: boolean): Promise<any>{
		return new Promise((resolve)=>{
			this.variablesLoaded().then(()=>{
				// only clear container if needed
				if (clearAll) {
					container.clear();
					if(!clearPartially){
						this.containerComponents = [];
					}
				}
				// get modified list
				const modifiedComponents = this.getModifiedComponents(components).map(x=> x.component);
				// create components one by one, search for variable instances
				modifiedComponents.forEach((comp, i: number)=>{
					// get a formatted component with new and already saved values
					this.getFormattedComponent(comp.ID, comp).then((component: any)=>{
						// remove the component, to ensure it is only created once
						this.removeDynamicComponent(comp.ID);
						// add the component to view
						this.addFhemComponent(component.name, container).then((ref:any)=>{
							// load component info
							for (const [key, value] of Object.entries(component.attributes)) {
								if(component.attributes[key]){
									component.attributes[key].forEach((el)=>{
										ref.instance[el.attr] = el.value;
									});
								}
							}
							// assign other values
							ref.instance.ID = component.ID;

							// Miniconf loader
							// loaded from miniConf --> no real position is present
							if(!component.position){
								component.position = this.structure.getComponentPositionPixel(component);
								// assign position to room component
								const roomComponent: DynamicComponentDefinition = this.structure.getComponent(component.ID);
								roomComponent.position = component.position;
							}

							// positioning
							const width: number = parseInt(component.position.width || component.dimensions.minX);
							const height: number = parseInt(component.position.height || component.dimensions.minY);
							const top: number = parseInt(component.position.top || 0);
							const left: number = parseInt(component.position.left || 0);
							const rotation: number = parseInt(component.position.rotation || 0);
							// assign
							ref.instance.width = width + 'px';
							ref.instance.height = height + 'px';
							ref.instance.top = top + 'px';
							ref.instance.left = left + 'px';
							ref.instance.rotation = rotation + 'deg';
							ref.instance.zIndex = component.position.zIndex;
							// push comp to containerComponents
							this.containerComponents.push({ID: component.ID, REF: ref, container: container});
							// logging
							this.logger.info('Component: ' + component.name + ' ID: ' + component.ID + ' added');
							// check for length
							if(components.length -1 === i){
								resolve();
							}
						});
					});
				});
			});
		});
	}

	// add a fhem component
	public addFhemComponent(name: string, container: any): Promise<any> {
		return new Promise((resolve)=>{
			// create the Component
			const fhemComponent: DynamicComponent = this.fhemComponents.find(x => x.name === name);
			this.loadDynamicComponent(fhemComponent.path, true).then((ComponentType: any)=>{
				// get componentFactory
				const componentFactory = this.resolver.resolveComponentFactory(ComponentType);
				// add component to view
				const componentRef: any = container.createComponent(componentFactory);
				// change detection
				componentRef.changeDetectorRef.markForCheck();
				// resolve the component
				resolve(componentRef);
			});
		});
	}

	// create a standard helper component
	public createSingleComponent(name: string, container: any, opts?: any): void {
		// remove the component, to ensure it is only created once
		this.removeDynamicComponent(name);
		// create the Component
		const standardComponent: DynamicComponent = this.standardComponents.find(x => x.name === name);
		if(standardComponent){
			this.loadDynamicComponent(standardComponent.path, false).then((ComponentType: any)=>{
				const componentFactory = this.resolver.resolveComponentFactory(ComponentType);
				const component = container.createComponent(componentFactory);
				// add component to list
				this.containerComponents.push({ID: name, REF: component});
				// add options
				if(opts){
					for (const [key, value] of Object.entries(opts)) {
						component.instance[key] = value;
					}
				}
			});
		}
	}

	// removes any dynamic component in the current container
	public removeDynamicComponent(ID: string): void {
		const componentIndex = this.containerComponents.findIndex(x => x.ID === ID);
		if(componentIndex > -1){
			this.containerComponents[componentIndex].REF.destroy();
			this.containerComponents.splice(componentIndex, 1);
		}
	}

	// find fhem component by ID in container
	public findFhemComponent(componentID: string): any {
		return this.containerComponents.find(x=> x.ID === componentID);
	}

	// seperate component values into arrays
	public seperateComponentValues(obj:any): any{
		let res = {};
		// information push
		// determine if values should be transformed to json and split, due to arrays
		let push = (attr: string, key: string, value: any, json: boolean, split: boolean): void =>{
			res[attr] = res[attr] || [];
			res[attr].push({
				attr: key,
				value: ( json ? JSON.parse(value) : ( split ?  (Array.isArray(value) ? value : value.split(',')  ) : value ) )
			});
		}

		for (const [key, value] of Object.entries(obj)) {
			// simple data input
			if (`${key}`.substr(0, 4) === 'data') {
				push('attr_data', key, value, false, false);
			}
			// boolean value
			if (`${key}`.substr(0, 9) === 'bool_data') {
				push('attr_bool_data', key, value, true, false);
			}
			// array data selection
			if (`${key}`.substr(0, 8) === 'arr_data') {
				push('attr_arr_data', key, value, false, true);
			}
			// simple style selection
			if (`${key}`.substr(0, 5) === 'style') {
				push('attr_style', key, value, false, false);
			}
			// array style selection
			if (`${key}`.substr(0, 9) === 'arr_style') {
				push('attr_arr_style', key, value, false, true);
			}
			// simple icon selection
			if (`${key}`.substr(0, 4) === 'icon') {
				push('attr_icon', key, value, false, false);
			}
			// array icon selection
			if (`${key}`.substr(0, 8) === 'arr_icon') {
				push('attr_arr_icon', key, value, false, true);
			}
		}
		return res;
	}

	// push a component to a desired place/container
	public pushComponentToPlace(place: Array<any>, component: any): void{
		place.push({
			ID: '_' + Math.random().toString(36).substr(2, 9),
			name: component.name,
			attributes: component.attributes,
			position: {
				top: component.position ? component.position.top || 0 : 0,
				left: component.position ? component.position.left || 0 : 0,
				width: component.dimensions.minX,
				height: component.dimensions.minY,
				zIndex: 10
			},
			createScaler: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		});
		// container components
		if(component.container){
			// single container
			place[place.length - 1].attributes.components = [];
			// multi container
			if(component.container === 'multi'){
				// get page amount of multi container
				// data_pages is the unique ID for multi containers
				let pages:number = parseInt(component.attributes.attr_data.find(x => x.attr === 'data_pages').value);
				// ensure, that pages are positive and not 0
				pages = Math.abs(pages) === 0 ? 1 : Math.abs(pages);
				for (let i = 0; i < pages; i++) {
					place[place.length - 1].attributes.components.push({
						components: []
					});
				}
			}
		}
	}

	// get minified config
	public getMinifiedConfig(keepPos?: boolean): Promise<Room[]> {
		return new Promise((resolve)=>{
			let transformer = (val: any)=>{
				return Array.isArray(val) ? JSON.stringify(val) : val;
			}
			// store miniConf as duplicate of current config
			let miniConf: Room[] = JSON.parse(JSON.stringify(this.structure.rooms));
			const allComponents: ComponentInStructure[] = this.structure.getAllComponents();
			if(allComponents.length === 0){
				resolve(miniConf);
			}
			// loop all components
			allComponents.forEach((componentStructure: ComponentInStructure, i: number)=>{
				let relevantComponent: DynamicComponentDefinition|null = this.structure.searchForComp(miniConf, componentStructure.component.ID);
				if(relevantComponent){
					// loop component attributes to remove default values
					// get component defaults
					this.getFhemComponentData(relevantComponent.name).then((compData: DynamicComponentDefinition)=>{
						const componentDefaults = compData;
						// look for duplicates
						for(const key of Object.keys(componentDefaults.attributes)){
							componentDefaults.attributes[key].forEach((value)=>{
								// look for identical values
								// check for new attributes
								// new attribute in App can cause crash from shared config
								if(Object.keys(relevantComponent.attributes).length > 0 && relevantComponent.attributes[key]){
									// get relevant
									let ind = relevantComponent.attributes[key].findIndex(x=> x.attr === value.attr && transformer(x.value) === transformer(value.value));
									if(ind > -1){
										relevantComponent.attributes[key].splice(ind, 1);
									}
									if(Object.keys(relevantComponent.attributes[key]).length === 0){
										delete relevantComponent.attributes[key];
									}
								}
							});
						}
						// nested components may never receive position attributes due to: Exp. not opening popup when using shared config
						// ignore those cases and just take already generated percentage positions
						if('position' in relevantComponent){
							// get percentage position
							relevantComponent['position_P'] = this.structure.getComponentPositionPercentage(relevantComponent);
						}
						// remove not needed parts
						if('type' in relevantComponent){
							delete relevantComponent.type;
						}
						if('dependencies' in relevantComponent){
							delete relevantComponent.dependencies;
						}
						if('container' in relevantComponent){
							delete relevantComponent.container;
						}
						if('dimensions' in relevantComponent){
							delete relevantComponent.dimensions;
						}
						if(!keepPos){
							if('createScaler' in relevantComponent){
								delete relevantComponent.createScaler;
							}
							if('position' in relevantComponent){
								delete relevantComponent.position;
							}
						}
						// end after all components are modified
						// end when no component is present --> no loop
						if(allComponents.length -1 === i){
							resolve(miniConf);
						}
					});
				}
			});
		});
	}
}