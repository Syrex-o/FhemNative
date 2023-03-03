// Version helpers

import { Version } from "@fhem-native/app-config"; 

/**
 * Transform Version definition to string
 * @param versionCode 
 * @returns 
 */
export function getRawVersionCode(versionCode: Version): string {
    return `${versionCode.major}.${versionCode.minor}.${versionCode.patch}`;
}

/**
 * Transform Version definition to number code
 * @param versionCode 
 * @returns 
 */
export function getTranslatedVersionCode(versionCode: Version): number{
    return versionCode.major * 10000 + versionCode.minor * 1000 + versionCode.patch * 100;
}