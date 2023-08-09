import { InjectionToken } from '@angular/core';
import { Version } from './version';

export * from './properties';
export * from './fhem-components';
export * from './version';

export interface AppConfig {
    production: boolean,
    platform: Platform,
    versionCode: Version
}

export type Platform = 'mobile'|'desktop';

export const APP_CONFIG = new InjectionToken<AppConfig>('Application config');