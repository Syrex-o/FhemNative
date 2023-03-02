import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { SettingsService, StorageService, StructureService } from '@fhem-native/services';

@Injectable()
export class SandboxGuardService implements CanActivate {
    constructor(
        private storage: StorageService,
        private settings: SettingsService,
        private structure: StructureService, private router: Router){
    }

    async canActivate(): Promise<boolean> {
        return new Promise((resolve)=>{
            if(!this.structure.rooms.length){
                this.storage.initStorage().then(()=>{
                    Promise.all([
                        this.settings.loadDefaults(),
                        this.structure.loadRooms()
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