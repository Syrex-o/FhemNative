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

/**
 * raw version code string to formatted version definition
 * @param versionCode Exp. '1.0.0'
 * @returns formatted version definition
 */
export function versionCodeToVersion(versionCode: string): Version {
    const splitVersion = versionCode.split('.');

    const vCode = {
        major: parseInt(splitVersion[0]) || 0, 
        minor: parseInt(splitVersion[1]) || 0, 
        patch: parseInt(splitVersion[2]) || 0
    };

    return vCode;
}