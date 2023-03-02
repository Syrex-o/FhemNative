import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { fromEvent, take } from "rxjs";

import { ToastService } from "./toast.service";
import { LoaderService } from "./loader.service";

import { APP_CONFIG } from "@fhem-native/app-config";

import { Room } from "@fhem-native/types/room";
import { FhemComponentSettings } from "@fhem-native/types/components";

// Plugins
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Injectable()
export class ImportExportService {
    private readonly baseFileName = 'FhemNative-Export';

    private readonly logExportKey = 'Logs';
    private readonly fullExportKey = 'RoomSettings';
    private readonly componentExportKey = 'ComponentSettings';

    constructor(
        private window: Window,
        private toast: ToastService,
        private loader: LoaderService,
        @Inject(APP_CONFIG) private appConfig: any, 
        @Inject(DOCUMENT) private document: Document){
    }

    exportComponents(componentSettings: FhemComponentSettings[]): void{
        const data = { versionCode: this.getRawVersionCode(), components: componentSettings };
        this.exportToJson( JSON.stringify(data), this.componentExportKey );
    }

    async importComponents(): Promise<FhemComponentSettings[]|null>{
        this.loader.showLogoLoader();

        const data = await this.fileImporter();
        let formattedData: FhemComponentSettings[]|null = null;
        if(data){
            const importedData = this.importIsValid(data);
            if(importedData){
                if(!importedData['components']){
                    this.toast.showTranslatedAlert(
                        'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.TEXT',
                        'MENUS.IMPORT.ERRORS.NO_COMPONENT_CONFIG.INFO',
                        false
                    );
                }else{
                    formattedData = importedData['components'];
                }
            }
        }
        this.loader.hideLoader();
        return formattedData;
    }

    exportRooms(rooms: Room[]): void{
        const data = { versionCode: this.getRawVersionCode(), rooms: rooms };
        this.exportToJson( JSON.stringify(data), this.fullExportKey );
    }

    async importRooms(): Promise<Room[]|null>{
        this.loader.showLogoLoader();

        const data = await this.fileImporter();
        if(!data) return null;

        const importedData = this.importIsValid(data);
        if(!importedData) return null;

        if(!importedData['rooms']){
            this.toast.showTranslatedAlert('MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.NO_ROOM_CONFIG.INFO', false);
            return null;
        }

        return importedData['rooms'] as Room[];
    }

    exportLogs(logs: string[]): void{
        const data = { versionCode: this.getRawVersionCode(), logs: logs };
        this.exportToJson( JSON.stringify(data), this.logExportKey );
    }

    public getRawVersionCode(): string {
        const vCode = this.appConfig.versionCode;
        return `${vCode.major}.${vCode.minor}.${vCode.patch}`;
    }

    private getTranslatedVersionCode(): number{
        const vCode = this.appConfig.versionCode;
        return vCode.major * 10000 + vCode.minor * 1000 + vCode.patch * 100;
    }

    private getFileDate(): string{
        const padL = (nr: number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
        const dt = new Date();
        return `${padL(dt.getMonth()+1)}/${padL(dt.getDate())}/${dt.getFullYear()} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`;
    }

    private importIsValid(data: string): Record<string, any>|null{
        try{
            const d = JSON.parse(data);
            if(!d['versionCode']){
                this.falseConfigToast();
                return null;
            }
            return d;
        }catch{
            this.falseConfigToast();
            return null;
        }
    }

    private falseConfigToast(): void{
        this.toast.showTranslatedAlert('MENUS.IMPORT.ERRORS.FALSE_CONFIG.TEXT', 'MENUS.IMPORT.ERRORS.FALSE_CONFIG.INFO', false);
    }

    private async fileImporter(): Promise<string | null>{
        const result = await FilePicker.pickFiles({ types: ['application/json'], readData: true }).catch(()=> null);

        if(result && result.files[0] && result.files[0].data){
            return window.atob(result.files[0].data);
        }
        return null;

        // OLD logic
        // return new Promise((resolve)=>{
        //     const i: HTMLInputElement = this.document.createElement('input');
        //     i.type = 'file';
        //     i.accept = 'application/json';

        //     let file: File|null = null;

        //     fromEvent<Event>(this.window, 'focus').pipe( take(1) ).subscribe(()=>{
        //         setTimeout(()=>{
        //             if(file){
        //                 const fileReader = new FileReader();
        //                 fileReader.onload = ()=> resolve(fileReader.result as string);
        //                 fileReader.readAsText(file);
        //             }else{
        //                 resolve(null);
        //             }
        //         }, 100);
        //     });

        //     fromEvent<Event>(i, 'change').pipe( take(1) ).subscribe((e: any)=> file = e.target.files[0] );

        //     i.click();
        //     i.remove();
        // });
    }

    private async exportToJson(data: string, fileNameEnding: string){
        // const a: HTMLAnchorElement = this.document.createElement('a');
        // const file = new Blob([data], {type: 'application/json'});
        // a.href = URL.createObjectURL(file);
        // a.download = `${this.baseFileName}-${fileNameEnding}-${this.getFileDate()}.json`;
        // a.click();
    }
}