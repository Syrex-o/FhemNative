import { Injectable } from '@angular/core';

import { SandboxStructureService } from './sandbox-structure.service';

import { ComponentLoaderService, SelectComponentService } from '@fhem-native/services';

@Injectable({providedIn: 'root'})
export class SandboxSelectComponentService extends SelectComponentService {
	constructor(
        override structure: SandboxStructureService, 
        override compLoader: ComponentLoaderService){
        super(structure, compLoader)
    }
}