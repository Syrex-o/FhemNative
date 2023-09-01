// import export helpers
import { getFileDate } from "./helpers";

// Plugins
// import { FileSharer } from '@byteowls/capacitor-filesharer';
import { FilePicker, PickFilesResult } from '@capawesome/capacitor-file-picker';

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
    // const res = await FileSharer.share({
    //     filename: `${baseFileName}-${fileNameEnding}-${getFileDate()}.json`,
    //     contentType: 'application/json',
    //     base64Data: window.btoa( JSON.stringify(exportData) )
    // }).then(()=> true).catch(()=> false);

    // return res;
    return false;
}

export async function fileImporter(types: string[]): Promise<PickFilesResult|null >{
    const result = await FilePicker.pickFiles({ types, readData: true }).catch(()=> null);
    return result;
}

/**
 * Import data from image/* file
 * @returns image data : mimeType + data or null
 */
export async function imageImporter(): Promise<{data: string, mimeType: string} | null> {
    const result = await fileImporter(['image/gif', 'image/jpeg', 'image/png']);
    if(result && result.files[0] && result.files[0].data){
        return { data: result.files[0].data, mimeType: result.files[0].mimeType  };
    }
    return null;
}

/**
 * Import data from JSON file
 * @returns string of data or null
 */
export async function jsonImporter(): Promise<string | null>{
    const result = await fileImporter(['application/json']);
    if(result && result.files[0] && result.files[0].data) return window.atob(result.files[0].data);
    return null;
}

