import { Injectable } from '@angular/core';

import { SettingsService } from '@fhem-native/services';
import { TranslateService } from '@ngx-translate/core';
import { SandboxStorageService } from './sandbox-storage.service';

@Injectable({providedIn: 'root'})
export class SandboxSettingsService extends SettingsService {
    constructor(override storage: SandboxStorageService, override translate: TranslateService){
        super(storage, translate);
    }
}