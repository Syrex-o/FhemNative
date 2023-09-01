import { Injectable } from '@angular/core';


import { SandboxStorageService } from './services/sandbox-storage.service';
import { SandboxStructureService } from './services/sandbox-structure.service';

import { SettingsService } from '@fhem-native/services';

@Injectable()
export class SandboxGuardService  {
    constructor(
        private settings: SettingsService,
        private storage: SandboxStorageService,
        private structure: SandboxStructureService){
    }

    async canActivate(): Promise<boolean> {
        return new Promise((resolve)=>{
            if(this.structure.rooms.length === 0){
                this.storage.initStorage().then(()=>{
                    Promise.all([
                        this.settings.loadDefaults(),
                        this.structure.loadRooms(true)
                    ]).then(()=>{
                        this.structure.rooms[0].name = 'Sandbox';
                        resolve(true);
                    });
                });
            }else{
                resolve(true);
            }
        });
    }
}