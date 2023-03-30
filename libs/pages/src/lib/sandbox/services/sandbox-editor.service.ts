import { Injectable } from '@angular/core';

import { ComponentLoaderService, EditorService, SelectComponentService, UndoRedoService } from '@fhem-native/services';
import { SandboxStructureService } from './sandbox-structure.service';

@Injectable({providedIn: 'root'})
export class SandboxEditorService extends EditorService {
	constructor(
		override structure: SandboxStructureService,
		override undoManager: UndoRedoService,
		override compLoader: ComponentLoaderService,
		override selectComponent: SelectComponentService){
		super(structure, undoManager, compLoader, selectComponent);
	}
}