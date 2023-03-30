import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';

import { clone, getUID } from '@fhem-native/utils';

import { ComponentContainerComponent, ComponentSettings, ContainerRegistry, FhemComponentContainerSettings, FhemComponentSettings } from '@fhem-native/types/components';

@Injectable({providedIn: 'root'})
export class ComponentLoaderService {
	/**
	 * Registry of active containers
	 * Flat list of containers --> overwrites when container is created with same id
	*/
	public componentContainerRegistry: ContainerRegistry[] = [];

	/**
	 * Register new container in registry
	 * @param containerId UID of component container
	 * @param container 
	 */
	public addContainerRegistry(containerId: string, container: ViewContainerRef): ContainerRegistry{
		// check if registry already exists
		const existingContainer = this.getContainerRegistry(containerId);
		if(existingContainer){
			existingContainer.components = [];
			existingContainer.container = container;
			return existingContainer;
		}else{
			this.componentContainerRegistry.push({ containerId: containerId, container: container, components: [] });
			return this.componentContainerRegistry[this.componentContainerRegistry.length -1];
		}
	}

	/**
	 * Remove container from registry
	 * @param containerId UID of component container
	 */
	public deleteContainerRegistry(containerId: string): void{
		const containerIndex = this.componentContainerRegistry.findIndex(x=> x.containerId === containerId);
		if(containerIndex > -1) this.componentContainerRegistry.splice(containerIndex, 1);
	}

	/**
	 * Get specifoc container from registry
	 * @param containerId UID of component container
	 * @returns Registry, if found
	 */
	public getContainerRegistry(containerId: string): ContainerRegistry|undefined {
		return this.componentContainerRegistry.find((x)=> x.containerId === containerId);
	}

	/**
	 * 
	 * @param componentId 
	 * @returns UID of component
	 */
	public getComponentFromRegistry(componentId: string): ComponentContainerComponent|null{
		for(const containerRegistry of this.componentContainerRegistry){
			const containerComponent: ComponentContainerComponent|undefined = containerRegistry.components.find(x=> x.componentUID === componentId);
			if(containerComponent) return containerComponent;
		}
		return null;
	}

	/**
	 * Remove component from view and reference list
	 * @param componentRegistry ComponentContainerComponent
	 */
	public destroyComponent(componentRegistry: ComponentContainerComponent): void{
		// get relevant container
		const componentContainer = this.getContainerRegistry(componentRegistry.containerId);
		const componentRegistryIndex = componentContainer?.components.findIndex(x=> x.componentUID === componentRegistry.componentUID);
		if(!componentContainer || componentRegistryIndex === undefined || componentRegistryIndex < 0) return;
		
		// remove component
		componentRegistry.component.destroy();
		componentContainer.components.splice(componentRegistryIndex, 1);
	}

	/**
	 * Transform component name to file name
	 * @param rawCompName 
	 * @returns transformed component name to find in file system
	 */
	private getFhemComponentName(rawCompName: string): string{
		return 'fhem-' + rawCompName.toLocaleLowerCase().replace(' ', '-');
	}

	/**
	 * Get the configuration of a fhem-component
	 * @param compRef component reference name
	 * @returns ComponentSettings
	 */
	public async importFhemComponentConfig(compRef: string): Promise<ComponentSettings>{
		const compName = this.getFhemComponentName(compRef);
		const compModule = await import(`../../../fhem-components/src/lib/_settings/${compName}`);

		return clone(compModule.Settings);
	}

	/**
	 * Get a fhem-component
	 * @param compRef component reference name
	 * @returns Componente Type
	 */
	public async importFhemComponent(compRef: string): Promise<Type<any>>{
		const compName = this.getFhemComponentName(compRef);
		const compModule = await import(`../../../fhem-components/src/lib/${compName}/${compName}.component`);

		const componentRefName: string = Object.keys(compModule)[0];
		const component: Type<any> = compModule[componentRefName];

		return component;
	}

	/**
	 * Transform nested component settings to flat object list
	 * @param compData 
	 * @returns Flat component data
	 */
	public flattenComponentConfig(compData: Record<string, any>): Record<string, any> {
		const flatData: Record<string, any> = {};

		for( const value of Object.values(compData)){
			for(const [nestedKey, nestedValue] of Object.entries(value)){
				// check nested value
				if(typeof nestedValue === 'object' && nestedValue !== null){
					// check for blank array --> no {items, value} definition
					if( 'value' in nestedValue ){
						flatData[nestedKey] = (nestedValue as any).value;
					}else{
						flatData[nestedKey] = nestedValue;
					}
				}else{
					flatData[nestedKey] = nestedValue;
				}
			}
		}
		return flatData;
	}

	/**
	 * Transform saved configuration to relevant config for component creation 
	 * Get form of defautl file definition with user updated inputs
	 * @param currentComponentConfig 
	 * @returns base component settings with user inputs
	 */
	public async unFlattenComponentConfig(currentComponentConfig: FhemComponentSettings): Promise<ComponentSettings>{
		const baseComponentSettings = await this.importFhemComponentConfig(currentComponentConfig.name);

		// create blank config
		const compConfig: ComponentSettings = {
			name: currentComponentConfig.name,
			type: baseComponentSettings.type,
			dimensions: baseComponentSettings.dimensions,
			inputs: { data: {} }
		}

		const inputUnflattener = (relevantKey: string): void =>{
			for(const [inputKey, inputValue] of Object.entries( (baseComponentSettings as any)[relevantKey] )){
				const relevantObj = (compConfig as any)[relevantKey];
				// assign default
				relevantObj[inputKey] = inputValue;
				for(const [nestedInputKey, nestedInputValue] of Object.entries(relevantObj[inputKey])){
					// check for current value
					if(nestedInputKey in (currentComponentConfig as any)[relevantKey] ){
						
						if(typeof nestedInputValue === 'object' && nestedInputValue !== null && !Array.isArray(nestedInputValue)){
							relevantObj[inputKey][nestedInputKey].value = (currentComponentConfig as any)[relevantKey][nestedInputKey];
						}else{
							relevantObj[inputKey][nestedInputKey] = (currentComponentConfig as any)[relevantKey][nestedInputKey];
						}
					}
				}
			}
		}

		// transform objects and compare to config
		inputUnflattener('inputs');
		if(baseComponentSettings.customInputs) inputUnflattener('customInputs');

		// assign dependencies
		if(baseComponentSettings.dependencies) compConfig.dependencies = baseComponentSettings.dependencies;

		return compConfig;
	}
	
	/**
	 * Create a Blank container for nested components
	 * @param componentId 
	 * @returns 
	 */
	public getBlankComponentContainer(componentId: string): FhemComponentContainerSettings{
		return { containerUID: componentId + '_' + getUID(), components: [] }
	}

	/**
	 * Compress component settings
	 * Keep just the changes compared to default component settings
	 * @param currentComponentConfig 
	 * @returns 
	 */
	public async getCompressedFhemComponentConfig(currentComponentConfig: FhemComponentSettings): Promise<FhemComponentSettings>{
		// get unfolded config
		const baseComponentSettings = await this.importFhemComponentConfig( currentComponentConfig.name );
		const baseComponentConfig = this.getFhemComponentConfig(baseComponentSettings);

		const compressor = (relevantKey: string): void =>{
			for(const [key, value] of Object.entries((baseComponentConfig as any)[relevantKey])){
				if(key in (currentComponentConfig as any)[relevantKey]){
					if((currentComponentConfig as any)[relevantKey][key] === (baseComponentConfig as any)[relevantKey][key]){
						// delete on same entry
						delete (currentComponentConfig as any)[relevantKey][key];
					}
				}else{
					// delete, when key not present
					delete (currentComponentConfig as any)[relevantKey][key];
				}
			}
		}

		// transform objects and compare to config
		compressor('inputs');
		if(baseComponentSettings.customInputs) compressor('customInputs');

		return currentComponentConfig;
	}

	/**
	 * Get configuration for component creation from storage/creation configuration
	 * @param baseComponentConfig 
	 * @returns FhemComponentSettings
	 */
	public getFhemComponentConfig(baseComponentConfig: ComponentSettings, existingConfig?: FhemComponentSettings): FhemComponentSettings{
		const componentPosition = existingConfig?.position || {
			top: '0%', left: '0%', zIndex: 1,
			width: baseComponentConfig.dimensions.minX + 'px', 
			height: baseComponentConfig.dimensions.minY + 'px', 
		};

		// create base config
		const compConfig: FhemComponentSettings = {
			UID: existingConfig?.UID || getUID(),
			position: componentPosition,
			name: baseComponentConfig.name,
			inputs: this.flattenComponentConfig(baseComponentConfig.inputs)
		};

		// assign custom inputs
		if(baseComponentConfig.customInputs) baseComponentConfig.customInputs = this.flattenComponentConfig(baseComponentConfig.customInputs);

		// check if component is container component
		if(baseComponentConfig.type === 'container'){
			if(existingConfig && existingConfig.components){
				compConfig.components = existingConfig.components;
				// check for page attribute --> default to 1
				const pageAttr: number = compConfig.inputs['containerPages'] || 1;
				const diff = compConfig.components.length - pageAttr;
				// determine if container size got bigger or smaller
				if (diff < 0) {
					// container size got bigger
					for (let i = 0; i < Math.abs(diff); i++) {
						compConfig.components.push( this.getBlankComponentContainer(compConfig.UID) );
					}
				}
				// container size got smaller
				else if(diff > 0){
					compConfig.components.splice( compConfig.components.length - (compConfig.components.length - pageAttr), compConfig.components.length );
				}
			}else{
				compConfig.components = [];
				// check for page attribute --> default to 1
				const pageAttr: number = compConfig.inputs['containerPages'] || 1;
				for(let i = 0; i < pageAttr; i++){
					// assign container UID
					compConfig.components.push( this.getBlankComponentContainer(compConfig.UID) );
				}
			}
		}
		return compConfig;
	}

	/**
	 * Get initial component config from definitions
	 * Compare/remove/update properties to match current configuration
	 * @param currentComponentConfig current Settings of component from storage
	 * @returns updated Settings with new/updated attributes
	 */
	public async getUpdatedFhemComponentConfig(currentComponentConfig: FhemComponentSettings): Promise<FhemComponentSettings>{
		// get base component settings and flatten
		const baseComponentSettings = await this.importFhemComponentConfig(currentComponentConfig.name);
		const compareComponentSettings: FhemComponentSettings = JSON.parse(JSON.stringify( currentComponentConfig ));
		compareComponentSettings.inputs = this.flattenComponentConfig(baseComponentSettings.inputs);		


		// add inputs from component settings / compare and remove unused settings
		currentComponentConfig.inputs = this.compareAndAssignComponentInputs(currentComponentConfig.inputs, compareComponentSettings.inputs);
		if(currentComponentConfig.customInputs && compareComponentSettings.customInputs){
			currentComponentConfig.customInputs = this.compareAndAssignComponentInputs(currentComponentConfig.customInputs, compareComponentSettings.customInputs);
		}

		return currentComponentConfig;
	}

	/**
	 * Add common inputs to component instance
	 * @param componentRef 
	 * @param componentSettings 
	 */
	public addComponentMeta(componentRef: ComponentRef<any>, componentSettings: FhemComponentSettings): void{
		// add component metadata
		componentRef.instance.UID = componentSettings.UID;
		componentRef.instance.position = componentSettings.position;
	}

	/**
	 * Adds inputs/customInputs to component instance
	 * @param componentRef 
	 * @param componentSettings FhemComponentSettings
	 */
	public addComponentInputs(componentRef: ComponentRef<any>, componentSettings: FhemComponentSettings): void{
		const setInputs = (key: string): void =>{
			for(const [settingsKey, settingsValue] of Object.entries((componentSettings as any)[key])){
				componentRef.instance[settingsKey] = settingsValue;
			}
		}

		// add standard inputs
		setInputs('inputs');
		// add custom inputs
		if(componentSettings.customInputs) setInputs('customInputs');
	}

	/**
	 * Compare component inputs
	 * @param currentInputs room storage component inputs
	 * @param compareInputs base component inputs from file reference
	 * @returns new list of inputs (removed settings, that are not relevant anymore / settings values from storage, that override default values)
	 */
	private compareAndAssignComponentInputs(currentInputs: Record<string, any>, compareInputs: Record<string, any>): Record<string, any>{
		const result: Record<string, any> = {};

		for(const [compareKey, compareValue] of Object.entries(compareInputs)){
			result[compareKey] = currentInputs[compareKey] !== undefined ?  currentInputs[compareKey] : compareValue;
		}
		return result;
	}

	/**
	 * Add Component to view and create reference
	 * @param containerRegistry
	 * @param componentSettings
	 * @param component
	 */
	public addFhemComponent(containerRegistry: ContainerRegistry, componentSettings: FhemComponentSettings, component: Type<any>): void{
		// create component
		const compRef = containerRegistry.container.createComponent(component);

		// add component metadata
		this.addComponentMeta(compRef, componentSettings);
		// add settings to instance
		this.addComponentInputs(compRef, componentSettings);

		// add component to registry
		containerRegistry.components.push({ component: compRef, componentUID: componentSettings.UID, containerId: containerRegistry.containerId });
	}
   
   /**
	* Load components of certain registry to room
	* @param components 
	* @param containerRegistry
	*/
	public async loadContainerComponents(components: FhemComponentSettings[], containerRegistry: ContainerRegistry): Promise<void>{
		for(let componentSettings of components){
			// load dynamic component
			const component = await this.importFhemComponent(componentSettings.name);

			// update component settings, to match current definition in component definition
			componentSettings = await this.getUpdatedFhemComponentConfig(componentSettings);

			// add component to view
			this.addFhemComponent(containerRegistry, componentSettings, component);
		}
	}
}