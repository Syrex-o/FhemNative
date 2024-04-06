import { Inject, Injectable, inject } from "@angular/core";
import { AlertController, AlertOptions } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

import { LoaderService } from "./loader.service";

import { APP_CONFIG, AppConfig } from "@fhem-native/app-config";
import { jsonImporter, JsonExportData, getRawVersionCode, barcodeImporter } from "@fhem-native/utils";

import { Room } from "@fhem-native/types/room";
import { FhemComponentSettings } from "@fhem-native/types/components";

@Injectable({providedIn: 'root'})
export class ImportExportService {
    readonly baseFileName = 'FhemNative-Export';
    private readonly componentExportType = 'Components';
    private readonly componentExportFileName = 'ComponentSettings';

    private readonly roomExportType = 'Rooms';
    private readonly roomExportFileName = 'RoomSettings';

    private loader = inject(LoaderService);
    private alertCtrl = inject(AlertController);
    private translate = inject(TranslateService);

    constructor(@Inject(APP_CONFIG) protected appConfig: AppConfig){}

    // overwritten function from platform specific services
    public async exportToJson(exportData: JsonExportData, fileNameEnding: string): Promise<boolean>{
        return false;
    }

    /**
     * Prepare data for component export via file or QR
     * @param componentSettings 
     * @returns 
     */
    public getComponentExportData(componentSettings: FhemComponentSettings[]){
        return { 
            type: this.componentExportType, 
            versionCode: getRawVersionCode(this.appConfig.versionCode), 
            data: componentSettings 
        }
    }

    async exportComponents(componentSettings: FhemComponentSettings[]) {
        const success = await this.exportToJson(
            this.getComponentExportData(componentSettings), 
            this.componentExportFileName
        );
        if(!success) this.exportFailedToast();
    }

    async importComponentsFromFile(): Promise<FhemComponentSettings[]|null>{
        this.loader.showLogoLoader();

        const data = await jsonImporter();
        let formattedData: FhemComponentSettings[]|null = null;
        if(data){
            const importedData = this.importIsValid(data);
            if(importedData && importedData.type === this.componentExportType){
                formattedData = importedData.data;
            }else{
                this.showAlert('MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.INFO');
            }
        }
        this.loader.hideLoader();
        return formattedData;
    }

    async importComponentsFromPhoto(): Promise<FhemComponentSettings[]|null>{
        this.loader.showLogoLoader();

        const data = await barcodeImporter();
        let formattedData: FhemComponentSettings[]|null = null;
        if(data){
            const importedData = this.importIsValid(data);
            if(importedData && importedData.type === this.componentExportType){
                formattedData = importedData.data;
            }else{
                this.showAlert('MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.INFO');
            }
        }

        this.loader.hideLoader();
        return formattedData;
    }

    async exportRooms(rooms: Room[]) {
        const success = await this.exportToJson( 
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
                this.showAlert('MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.INFO');
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
        this.showAlert('MENUS.IMPORT.ERRORS.FALSE_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.FALSE_CONFIG.INFO');
        return null;
    }

    private exportFailedToast(){
        this.showAlert('MENUS.EXPORT.ERRORS.FAILED_EXPORT.TEXT', 'MENUS.EXPORT.ERRORS.FAILED_EXPORT.INFO');
    }

    public exportFromBrowser(fileName: string, data: any): boolean{
        const blobDataStr = JSON.stringify(data);
        const bytes = new TextEncoder().encode(blobDataStr);
        const blob = new Blob([bytes], { type: "application/json;charset=utf-8" });

        try{
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = fileName;

            const clickHandler = () => {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    removeEventListener('click', clickHandler);
                }, 150);
            };

            a.addEventListener('click', clickHandler, false);
            a.click();
            a.remove();

            return true;
        }catch(err){
            return false;
        }
    }

    private async showAlert(head: string, message: string) {
		const opts: AlertOptions = {
			header: this.translate.instant(head),
			message: this.translate.instant(message),
			mode: 'md',
			buttons: [{text: this.translate.instant('BUTTONS.OKAY'), role: 'cancel'}]
		};
		// create new alert
		const alert = await this.alertCtrl.create(opts);
  		await alert.present();
	}
}