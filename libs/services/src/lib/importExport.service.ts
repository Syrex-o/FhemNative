import { Inject, Injectable } from "@angular/core";

import { ToastService } from "./toast.service";
import { LoaderService } from "./loader.service";

import { APP_CONFIG } from "@fhem-native/app-config";

import { Room } from "@fhem-native/types/room";
import { FhemComponentSettings } from "@fhem-native/types/components";

import { jsonImporter, JsonExportData, exportToJson, getRawVersionCode } from "@fhem-native/utils";

@Injectable()
export class ImportExportService {
    private readonly componentExportType = 'Components';
    private readonly componentExportFileName = 'ComponentSettings';

    private readonly roomExportType = 'Rooms';
    private readonly roomExportFileName = 'RoomSettings';

    constructor(private toast: ToastService, private loader: LoaderService, @Inject(APP_CONFIG) private appConfig: any){}

    async exportComponents(componentSettings: FhemComponentSettings[]) {
        const success = await exportToJson(
            { type: this.componentExportType, versionCode: getRawVersionCode(this.appConfig.versionCode), data: componentSettings }, 
            this.componentExportFileName
        );
        if(!success) this.exportFailedToast();
    }

    async importComponents(): Promise<FhemComponentSettings[]|null>{
        this.loader.showLogoLoader();

        const data = await jsonImporter();
        let formattedData: FhemComponentSettings[]|null = null;
        if(data){
            const importedData = this.importIsValid(data);
            if(importedData && importedData.type === this.componentExportType){
                formattedData = importedData.data;
            }else{
                this.toast.showTranslatedAlert(
                    'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.TEXT',
                    'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.INFO',
                    false
                );
            }
        }
        this.loader.hideLoader();
        return formattedData;
    }

    async exportRooms(rooms: Room[]) {
        const success = await exportToJson( 
            { type: this.roomExportType, versionCode: getRawVersionCode(this.appConfig.versionCode), data: rooms }, 
            this.roomExportFileName
        );
        if(!success) this.exportFailedToast();
    }

    async importRooms(): Promise<Room[]|null>{
        this.loader.showLogoLoader();

        const data = await jsonImporter();
        let formattedData: Room[]|null = null;
        if(data){
            const importedData = this.importIsValid(data);
            if(importedData && importedData.type === this.roomExportType){
                formattedData = importedData.data;
            }else{
                this.toast.showTranslatedAlert(
                    'MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.TEXT', 
                    'MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.INFO', 
                    false
                );
            }
        }
        this.loader.hideLoader();
        return formattedData;
    }

    private importIsValid(data: string): JsonExportData|null{
        try{
            const d = JSON.parse(data);
            if(!d['versionCode'] || !d['data'] || !d['type']) return this.falseConfigToast();
            return d;
        }catch{
            return this.falseConfigToast();
        }
    }

    private falseConfigToast(): null{
        this.toast.showTranslatedAlert('MENUS.IMPORT.ERRORS.FALSE_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.FALSE_CONFIG.INFO', false);
        return null;
    }

    private exportFailedToast(){
        this.toast.showTranslatedAlert('MENUS.EXPORT.ERRORS.FAILED_EXPORT.TEXT', 'MENUS.EXPORT.ERRORS.FAILED_EXPORT.INFO', false);
    }
}