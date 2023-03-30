import { Injectable } from '@angular/core';

import { StorageService } from '@fhem-native/services';


@Injectable({providedIn: 'root'})
export class SandboxStorageService extends StorageService {
    protected override storagePrefix = 'sandbox_';
}