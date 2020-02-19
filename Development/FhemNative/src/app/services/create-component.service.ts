import { ComponentFactoryResolver, Injectable, Type } from '@angular/core';

// Services
import { StructureService } from './structure.service';
import { HelperService } from './helper.service';

@Injectable({
	providedIn: 'root'
})

export class CreateComponentService {
	// list of Fhem Components
	public fhemComponents: Array<any>;

	// list of components that were added to the view
	public containerComponents;

	// the current container
	// container to place components
	public currentRoomContainer: any;

	constructor(
		private resolver: ComponentFactoryResolver,
		private structure: StructureService,
		private helper: HelperService) {
		this.fhemComponents = [];
		for (let i = 0; i < this.structure.fhemComponents.length; i++) {
			const comp = this.structure.fhemComponents[i].getSettings();
			this.fhemComponents.push({
				ID: i,
				name: comp.name,
				component: this.arrange(comp.inputs),
				REF: comp.component,
				type: comp.type,
				factoryClass: this.structure.fhemComponents[i] as Type<any>,
				dimensions: comp.dimensions
			});
		}
		// alphabetic sorting of components
		this.fhemComponents.sort((a, b) => (a.name > b.name) ? 1 : -1);
	}

	private arrange(item) {
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

	public clearContainer(container) {
		container.clear();
		this.containerComponents = [];
	}

	public loadRoomComponents(components, container, clear) {
		// only clear container if needed
		if (clear) {
			this.containerComponents = []; 
			this.clearContainer(container);
		}
		for (let i = 0; i < components.length; i++) {
			const ref = this.addFhemComponent(components[i].name, container);

			for (const [key, value] of Object.entries(components[i].attributes)) {
				if(components[i].attributes[key]){
					components[i].attributes[key].forEach((el)=>{
						ref.instance[el.attr] = el.value;
					});
				}
			}

			ref.instance.ID = components[i].ID;
			const comp = this.helper.find(this.fhemComponents, 'name', components[i].name);
			// component position
			const width: number = parseInt(components[i].position.width ? components[i].position.width : comp.item.dimensions.minX);
			const height: number = parseInt(components[i].position.height ? components[i].position.height : comp.item.dimensions.minY);
			const top: number = parseInt(components[i].position.top ? components[i].position.top : 0);
			const left: number = parseInt(components[i].position.left ? components[i].position.left : 0);

			ref.instance.width = width + 'px';
			ref.instance.height = height + 'px';
			ref.instance.top = top + 'px';
			ref.instance.left = left + 'px';

			ref.instance.zIndex = components[i].position.zIndex;

			// pushing componet to list
			this.containerComponents.push({
				REF: ref,
				ID: ref.instance.ID,
				container
			});
		}
	}

	public createSingleComponent(name, container, opts) {
		// check if component is present and remove it
		this.removeSingleComponent(name, container);

		const factories = Array.from(this.resolver['_factories'].keys());
		const factoryClass = factories.find((x: any) => x.key === name) as Type<any>;
		const componentFactory = this.resolver.resolveComponentFactory(factoryClass);
		// Add component to view
		const componentRef: any = container.createComponent(componentFactory);
		this.containerComponents.push(componentRef);

		if (opts) {
			for (const [key, value] of Object.entries(opts)) {
				componentRef.instance[key] = value;
			}
		}
		return componentRef;
	}

	// removes a single component in the current container
	public removeSingleComponent(name, container) {
		const factories = Array.from(this.resolver['_factories'].keys());
		const factoryClass = factories.find((x: any) => x.key === name) as Type<any>;
		const component = this.containerComponents.find((component) => component.instance instanceof factoryClass);
		const componentIndex = this.containerComponents.indexOf(component);

		if (componentIndex !== -1 && container && container.indexOf(component) !== -1) {
			container.remove(container.indexOf(component));
			this.containerComponents.splice(componentIndex, 1);
		}
	}

	public addFhemComponent(name, container) {
		const comp = this.helper.find(this.fhemComponents, 'name', name);
		// build component factory
		// factory class is assigned on load
		const componentFactory = this.resolver.resolveComponentFactory(comp.item.factoryClass);
		// add component to view
		const componentRef: any = container.createComponent(componentFactory);
		return componentRef;
	}

	// finding component in componentRef by ID
	// popup components are in the same container
	// popup components are removed on popup close
	// same for slider
	public removeFhemComponent(componentID: string) {
		const component = this.helper.find(this.containerComponents, 'ID', componentID);
		if (component) {
			component.item.container.remove(component.item.container.indexOf(component.item.REF));
			this.containerComponents.splice(component.index, 1);
		}
	}

	// find fhem component by ID
	public findFhemComponent(componentID: string) {
		const res = this.helper.find(this.containerComponents, 'ID', componentID);
		if (res) {
			res.item = res.item.REF;
		}
		return res;
	}

	// get a formatted component
	// new values + given values
	public getFormattedComponent(componentID: string){
		// get the component
		let component = this.structure.getComponent(componentID);
		// get component defaults
		const componentDefault = this.fhemComponents.find(x=> x.REF === component.REF);
		const defaults = this.seperateComponentValues(componentDefault.component);
		// look for new props in component
		for(const key of Object.keys(defaults)){
			// check for new attribute
			if( !(key in component.attributes) ){
				component.attributes[key] = defaults[key];
			}
			// assign default to new attribute
			defaults[key].forEach((value)=>{
				if( !component.attributes[key].find(x=> x.attr === value.attr) ){
					component.attributes[key].push(value);
				}
			});
		}
		// fix for arr_data function calling --> getting defaults
		if (component.attributes.attr_arr_data && component.attributes.attr_arr_data.length > 0) {
			for (let i = 0; i < component.attributes.attr_arr_data.length; i++) {
				component.attributes.attr_arr_data[i].defaults = this.getValues(component.REF, component.attributes.attr_arr_data[i].attr);
			}
		}
		// assign values, to ensure menu is created correctly
		component['comp'] = {name: component.name, type: componentDefault.type};
		component['dimensions'] = componentDefault.dimensions;

		return component;
	}

	// used to get default values for changing components
	public getValues(component, prop) {
		const comp = this.helper.find(this.fhemComponents, 'REF', component);
		for (const [key, value] of Object.entries(comp.item.component)) {
			if (`${key}` === prop) {
				return (`${value}`.split(',')) ? `${value}`.split(',') : `${value}`;
			}
		}
	}

	public seperateComponentValues(obj){
		let res = {};
		for (const [key, value] of Object.entries(obj)) {
			if (`${key}`.substr(0, 4) === 'data') {
				res['attr_data'] = res['attr_data'] || [];
				res['attr_data'].push({
					attr: `${key}`,
					value: `${value}`
				});
			}
			if (`${key}`.substr(0, 9) === 'bool_data') {
				res['attr_bool_data'] = res['attr_bool_data'] || [];
				res['attr_bool_data'].push({
					attr: `${key}`,
					value: JSON.parse(`${value}`)
				});
			}
			if (`${key}`.substr(0, 8) === 'arr_data') {
				res['attr_arr_data'] = res['attr_arr_data'] || [];
				res['attr_arr_data'].push({
					attr: `${key}`,
					value: `${value}`.split(',')
				});
			}
			if (`${key}`.substr(0, 5) === 'style') {
				res['attr_style'] = res['attr_style'] || [];
				res['attr_style'].push({
					attr: `${key}`,
					value: `${value}`
				});
			}
			if (`${key}`.substr(0, 9) === 'arr_style') {
				res['attr_arr_style'] = res['attr_arr_style'] || [];
				res['attr_arr_style'].push({
					attr: `${key}`,
					value: `${value}`.split(',')
				});
			}
			if (`${key}`.substr(0, 4) === 'icon') {
				res['attr_icon'] = res['attr_icon'] || [];
				res['attr_icon'].push({
					attr: `${key}`,
					value: `${value}`
				});
			}
			if (`${key}`.substr(0, 8) === 'arr_icon') {
				res['attr_arr_icon'] = res['attr_arr_icon'] || [];
				res['attr_arr_icon'].push({
					attr: `${key}`,
					value: `${value}`.split(',')
				});
			}
		}
		return res;
	}

	public pushComponentToPlace(place, component){
		place.push({
			ID: this.helper.UIDgenerator(),
			name: component.comp.name,
			REF: component.REF,
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
		// check if selected component is a popup container
		if (component.comp.name.match(/(Popup|Swiper)/)) {
			place[place.length - 1].attributes.components = [];
		}
		// check if selected component is a swiper container
		if (component.comp.name.match(/Swiper/)) {
			// data_pages is the unique way to define multiple container components
			let pages = parseInt(component.attributes.attr_data.find(x => x.attr === 'data_pages').value);
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
