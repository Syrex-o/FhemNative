// import export helpers
import { getFileDate } from "./helpers";

// Plugins
import { FileSharer } from '@byteowls/capacitor-filesharer';
import { FilePicker } from '@capawesome/capacitor-file-picker';

const baseFileName = 'FhemNative-Export';

export interface JsonExportData {
    type: string,
    versionCode: string,
    data: any
}

/**
 * Export Data to JSON
 * @param data 
 * @param fileNameEnding 
 */
export async function exportToJson(exportData: JsonExportData, fileNameEnding: string): Promise<boolean>{
    const res = await FileSharer.share({
        filename: `${baseFileName}-${fileNameEnding}-${getFileDate()}.json`,
        contentType: 'application/json',
        base64Data: window.btoa( JSON.stringify(exportData) )
    }).then(()=> true).catch(()=> false);

    return res;
}

/**
 * Import data from JSON file
 * @returns string of data or null
 */
export async function jsonImporter(): Promise<string | null>{
    const result = await FilePicker.pickFiles({ types: ['application/json'], readData: true }).catch(()=> null);

    if(result && result.files[0] && result.files[0].data) return window.atob(result.files[0].data);
    return null;
}