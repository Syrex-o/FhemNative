import { Injectable } from "@angular/core";

import { ImportExportService } from "../importExport.service";
import { JsonExportData, getFileDate } from "@fhem-native/utils";

@Injectable({providedIn: 'root'})
export class ImportExportServiceDesktop extends ImportExportService{
    override async exportToJson(exportData: JsonExportData, fileNameEnding: string): Promise<boolean>{
        const fileName = `${this.baseFileName}-${fileNameEnding}-${getFileDate()}.json`;
        return this.exportFromBrowser(fileName, exportData);
    }
}