import { Injectable } from '@angular/core';

import { ComponentLoaderService, UndoRedoService } from '@fhem-native/services';
import { SandboxStructureService } from './sandbox-structure.service';

@Injectable({providedIn: 'root'})
export class SandboxUndoRedoService extends UndoRedoService {
	constructor(
		override structure: SandboxStructureService,
		override compLoader: ComponentLoaderService){
        super(structure, compLoader);
	}
}