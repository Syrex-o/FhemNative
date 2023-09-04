import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { AsyncPipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Route, RouterModule } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

import { filter, map } from "rxjs";

import { LoaderModule } from "@fhem-native/components";
import { DocItemListComponent } from "@fhem-native/docs";

import { ComponentLoaderService, ImportExportService, LoaderService, ToastService } from "@fhem-native/services";
import { WebsettingsService } from "../shared/services/webSettings.service";

import { getUID, jsonImporter } from "@fhem-native/utils";

import { Room } from "@fhem-native/types/room";
import { ComponentSettings, FhemComponentSettings } from "@fhem-native/types/components";

interface ConverterError {
    type: 'info'|'error',
    message: string,
    noTranslate?: boolean
}

@Component({
    standalone: true,
	selector: 'fhem-native-website-config-converter',
	templateUrl: 'configConverter.page.html',
	styleUrls: ['configConverter.page.scss'],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        IonicModule,
        RouterModule,
        TranslateModule,

        LoaderModule,
        DocItemListComponent
    ],
    providers: [
        ImportExportService
    ]
})
export class ConfigConverterPageComponent {
    convertableItems$ = this.webSettings.getLanguageLoader().pipe(
        filter(x=> x),
        map(()=> {
            return [
                'WEB.CONF_CONVERTER.INFOS.EXAMPLE_1.CONVERTABLE.ROOMS',
                'WEB.CONF_CONVERTER.INFOS.EXAMPLE_1.CONVERTABLE.COMP_LISTS',
				'WEB.CONF_CONVERTER.INFOS.EXAMPLE_1.CONVERTABLE.SHARED_CONFIGS'
            ].map(x=> this.translate.instant(x) );
        })
    );

    importedConfig: unknown = [];
    
    converterErrors: ConverterError[] = [];
    convertedConfig: Room[] = [];
	convertedComponents: FhemComponentSettings[] = [];

    constructor(
		private toast: ToastService,
        public loader: LoaderService,
        private translate: TranslateService,
        private webSettings: WebsettingsService,
		private importExport: ImportExportService,
		private componentLoader: ComponentLoaderService){
    }

    async uploadConfig(): Promise<void>{
        this.loader.showLogoLoader();
		this.prepareConverter();
        const data = await jsonImporter();
		if(data){
			const importedData = this.validateJson(data);
			if(importedData){
				this.importedConfig = importedData;
				await this.runConverter();
			}
		}
        this.loader.hideLoader();
    }

    async pasteConfig(): Promise<void>{
		this.loader.showLogoLoader();
		this.prepareConverter();
		this.toast.showAlert(
			this.translate.instant('WEB.CONF_CONVERTER.SELECT.BUTTON_B'), 
			'', 
			{
				inputs: [
					{
						name: 'config',
						type: 'textarea',
						placeholder: 'Paste Config'
					}
				],
				buttons: [
					{
						text: this.translate.instant('WEB.CONF_CONVERTER.SELECT.BUTTON_D'),
						role: 'save',
						handler: async (e: any)=> {
							if(e.config !== ''){
								const importedData = this.validateJson(e.config);
								if(importedData){
									this.importedConfig = importedData;
									await this.runConverter();
								}
							}
							this.loader.hideLoader();
						}
					},
					{
						text: this.translate.instant('DICT.CANCEL'), 
						role: 'cancel',
						handler: ()=> this.loader.hideLoader()
					}
				]
			}
		)
    }

	private prepareConverter(): void{
		this.converterErrors = [];
        this.convertedConfig = [];
		this.convertedComponents = [];
	}

    private async runConverter(): Promise<void> {
        if( !Array.isArray(this.importedConfig) ){
            this.converterErrors.push({type: 'error', message: 'WEB.CONF_CONVERTER.ERRORS.NO_ARRAY'});
        }else{
			const firstItem = this.importedConfig[0];
			// check if first item is a component
			if('ID' in firstItem && 'attributes' in firstItem) return this.singleRoomConverter(this.importedConfig);

			// 
            if( !('components' in firstItem)){
                this.converterErrors.push({type: 'error', message: 'WEB.CONF_CONVERTER.ERRORS.FALSE_CONFIG'});
            }else{
                // check for rooms
                if('ID' in firstItem && 'UID' in firstItem){
					this.roomsConverter(this.importedConfig);
				}
            }
        }
    }

    private async roomsConverter(importedRooms: Array<any>): Promise<void>{
		const convertedRooms: Room[] = [];

		for(let i = 0; i < importedRooms.length; i++){
			const importedRoom = importedRooms[i];

			const updatedRoom: Room = {
                ID: i,
                UID: getUID(),
                name: importedRoom.name,
                icon: importedRoom.icon,
                components: []
            }

            if( !('components' in importedRoom) ){
                this.converterErrors.push({
					type: 'info',
					message: `${updatedRoom.name}: ${this.translate.instant('WEB.CONF_CONVERTER.ERRORS.NO_COMPS_IN_ROOM')}`, 
					noTranslate: true
				});
            }else{
				for(let j = 0; j < importedRoom.components.length; j++){
					let convertedComponent = await this.convertComponent(importedRoom.components[j]);
					if(convertedComponent) {
						convertedComponent = await this.componentLoader.getCompressedFhemComponentConfig(convertedComponent);
						updatedRoom.components.push(convertedComponent);
					}
				}
			}
			convertedRooms.push(updatedRoom);
		}
		this.convertedConfig = convertedRooms;
    }

	private async singleRoomConverter(importedComponents: Array<any>): Promise<void>{
		const convertedComponents: FhemComponentSettings[] = [];

		for(let i = 0; i < importedComponents.length; i++){
			let convertedComponent = await this.convertComponent(importedComponents[i]);
			if(convertedComponent) {
				convertedComponent = await this.componentLoader.getCompressedFhemComponentConfig(convertedComponent);
				convertedComponents.push(convertedComponent);
			}
		}
		this.convertedComponents = convertedComponents;
	}

    private async convertComponent(importedComponent: any): Promise<FhemComponentSettings|null>{
		try{
			// search component in available list
			const baseComponentConfig = await this.componentLoader.importFhemComponentConfig(importedComponent.name);
			// try to map inputs
			try{
				// map inputs
				for(const [key, value] of Object.entries(importedComponent.attributes)){
					// map old key
					if(key === 'attr_data') this.componentDataMapper(baseComponentConfig, value, 'data');
					if(key === 'attr_icon') this.componentDataMapper(baseComponentConfig, value, 'icon');
					if(key === 'attr_style') this.componentDataMapper(baseComponentConfig, value, 'style');
					if(key === 'attr_style') this.componentDataMapper(baseComponentConfig, value, 'style');
					if(key === 'attr_bool_data') this.componentDataMapper(baseComponentConfig, value, 'bool_data', 'bool');
					if(key === 'attr_arr_data') this.componentDataMapper(baseComponentConfig, value, 'arr_data', 'arr_data', 0);
					if(key === 'attr_arr_icon') this.componentDataMapper(baseComponentConfig, value, 'arr_icon');
					if(key === 'attr_arr_style') this.componentDataMapper(baseComponentConfig, value, 'arr_style');

					if(
						key !== 'attr_arr_data' &&
						key !== 'attr_arr_icon' &&
						key !== 'attr_arr_style' &&
						key !== 'attr_data' && key !== 'attr_icon' && key !== 'attr_style' && key !== 'attr_style' && key !== 'attr_bool_data'){
						console.log(importedComponent.name, key, value);
					}
				}
			}catch(e){
				this.converterErrors.push({
					type: 'error',
					message: `${importedComponent.name}: ${this.translate.instant('WEB.CONF_CONVERTER.ERRORS.COMP_NOT_CONVERTED')}`, 
					noTranslate: true
				});
			}
			// transform component inputs
			const componentConfig = this.componentLoader.getFhemComponentConfig(baseComponentConfig);
			// apply position
			if('position_P' in importedComponent){
				componentConfig.position.top = importedComponent.position_P.top;
				componentConfig.position.left = importedComponent.position_P.left;
				componentConfig.position.width = importedComponent.position_P.width;
				componentConfig.position.height = importedComponent.position_P.height;
				componentConfig.position.zIndex = importedComponent.position_P.zIndex;
			}else{
				this.converterErrors.push({
					type: 'info',
					message: `${importedComponent.name}: ${this.translate.instant('WEB.CONF_CONVERTER.ERRORS.NO_COMP_POSITION_PERCENTAGE')}`, 
					noTranslate: true
				});
			}
			return componentConfig;
		}catch(e){
			this.converterErrors.push({
				type: 'error',
				message: `${importedComponent.name}: ${this.translate.instant('WEB.CONF_CONVERTER.ERRORS.COMP_NOT_FOUND')}`, 
				noTranslate: true
			});
			return null;
		}
    }

	private componentDataMapper(
		baseComponentConfig: ComponentSettings, 
		importedSettings: any, mapper: string, 
		mapTo?: string, 
		pickFromArr?: number
	): void{

		const iMapper = mapTo || mapper;
		if(iMapper in baseComponentConfig.inputs){
			for(let i = 0; i < importedSettings.length; i++){
				const mappedSettingsKey = importedSettings[i].attr.replace(`${mapper}_`, '');
				if(mappedSettingsKey in (baseComponentConfig.inputs as any)[iMapper]){
					const relSetting = (baseComponentConfig.inputs as any)[iMapper];
					if(typeof relSetting[mappedSettingsKey] === 'object' && 'value' in relSetting[mappedSettingsKey]){
						relSetting[mappedSettingsKey].value = this.componentDataTypeMapper(
							relSetting[mappedSettingsKey],
							pickFromArr === undefined ? importedSettings[i].value : importedSettings[i].value[pickFromArr]
						);
					}else{
						relSetting[mappedSettingsKey] = this.componentDataTypeMapper(
							relSetting[mappedSettingsKey], 
							pickFromArr === undefined ? importedSettings[i].value : importedSettings[i].value[pickFromArr]
						);
					}
				}
			}
		}else{
			console.log(`!!! ${mapper}`)
		}
	}

	private componentDataTypeMapper(relSetting: any, value: any): any{
		try{
			if(!('type' in relSetting)) return value;
			if(relSetting.type === 'string') return value.toString();
			if(relSetting.type === 'number') return parseFloat(value);
			return value;
		}catch(e){
			return value;
		}
	}

	private validateJson(data: any): unknown|null{
		try{
			const d = JSON.parse(data);
			return d;
		}catch(e){
			this.converterErrors.push({type: 'error', message: 'WEB.CONF_CONVERTER.ERRORS.NO_JSON_FORMAT'});
			return null;
		}
	}

    downloadRooms(): void{
        this.importExport.exportRooms(this.convertedConfig);
    }

	downloadComponents(): void{
		this.importExport.exportComponents(this.convertedComponents);
	}
}

export const CONFIG_CONVERTER_ROUTES: Route[] = [
    {
        path: '',
        component: ConfigConverterPageComponent
    }
];