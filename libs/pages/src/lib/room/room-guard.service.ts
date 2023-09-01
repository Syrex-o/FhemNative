import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { StructureService } from '@fhem-native/services';

@Injectable()
export class RoomGuardService  {
    constructor(private structure: StructureService, private router: Router) {}

    canActivate(): boolean {
        if(this.structure.structuredRooms.length > 0) return true;
        
        this.router.navigate([''], {replaceUrl: true});
        return false;
    }
}