import { Component} from '@angular/core';

import { UndoRedoService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-room-header-undo-redo',
	templateUrl: './undo-redo.component.html',
	styleUrls: ['./undo-redo.component.scss']
})
export class RoomHeaderUndoRedoComponent{
	constructor(public undoManager: UndoRedoService){}
}