import { ComponentFactoryResolver, Injectable, Type, Injector } from '@angular/core';

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
		private helper: HelperService,
 		private injector: Injector) {
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

			// adding component attributes
			for (let f = 0; f < components[i].attributes.bool_data.length; f++) {
				ref.instance[components[i].attributes.bool_data[f].attr] = components[i].attributes.bool_data[f].value;
			}
			for (let g = 0; g < components[i].attributes.arr_data.length; g++) {
				ref.instance[components[i].attributes.arr_data[g].attr] = components[i].attributes.arr_data[g].value;
			}
			for (let h = 0; h < components[i].attributes.arr_style.length; h++) {
				ref.instance[components[i].attributes.arr_style[h].attr] = components[i].attributes.arr_style[h].value;
			}
			for (let j = 0; j < components[i].attributes.data.length; j++) {
				ref.instance[components[i].attributes.data[j].attr] = components[i].attributes.data[j].value;
			}
			for (let k = 0; k < components[i].attributes.style.length; k++) {
				ref.instance[components[i].attributes.style[k].attr] = components[i].attributes.style[k].value;
			}
			if (components[i].attributes.icon.length > 0) {
				for (let l = 0; l < components[i].attributes.icon.length; l++) {
					ref.instance[components[i].attributes.icon[l].attr] = components[i].attributes.icon[l].value;
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
	public removeFhemComponent(componentID) {
		const component = this.helper.find(this.containerComponents, 'ID', componentID);
		if (component) {
			component.item.container.remove(component.item.container.indexOf(component.item.REF));
			this.containerComponents.splice(component.index, 1);
		}
	}

	public findFhemComponent(componentID) {
		const res = this.helper.find(this.containerComponents, 'ID', componentID);
		if (res) {
			res.item = res.item.REF;
		}
		return res;
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
}
