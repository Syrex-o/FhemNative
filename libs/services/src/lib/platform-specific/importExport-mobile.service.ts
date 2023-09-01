import { Injectable } from "@angular/core";

import { ImportExportService } from "../importExport.service";
import { JsonExportData, getFileDate } from "@fhem-native/utils";


import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'

@Injectable({providedIn: 'root'})
export class ImportExportServiceMobile extends ImportExportService{
    override async exportToJson(exportData: JsonExportData, fileNameEnding: string): Promise<boolean>{
        const fileName = `${this.baseFileName}-${fileNameEnding}-${getFileDate()}.json`;
        
        // web
        if(Capacitor.getPlatform() === 'web') return this.exportFromBrowser(fileName, exportData);
        
        // ios/android
        try {
            const directory = Capacitor.getPlatform() === 'ios' ? Directory.Documents : Directory.Documents;
            await Filesystem.requestPermissions();

            await Filesystem.writeFile({
                path: `FhemNative-Exports/${fileName}`,
                data: JSON.stringify(exportData),
                encoding: Encoding.UTF8,
                directory: directory,
                recursive: true
            });

            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
}