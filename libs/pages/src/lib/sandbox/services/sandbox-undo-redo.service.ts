import { Injectable } from '@angular/core';

import { ComponentLoaderService, FhemService, UndoRedoService } from '@fhem-native/services';
import { SandboxStructureService } from './sandbox-structure.service';

@Injectable({providedIn: 'root'})
export class SandboxUndoRedoService extends UndoRedoService {
	constructor(
		override fhem: FhemService,
		override structure: SandboxStructureService,
		override compLoader: ComponentLoaderService){
        super(fhem, structure, compLoader);
	}
}