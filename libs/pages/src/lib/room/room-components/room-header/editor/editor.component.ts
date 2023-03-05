import { Component, ViewChild, ViewEncapsulation} from '@angular/core';
import { IonPopover } from '@ionic/angular';

import { EditorService, SettingsService, StructureService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-room-header-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class RoomHeaderEditorComponent{
	@ViewChild('MobilePopover', {read: IonPopover}) mobilePopover: IonPopover|undefined;

	coreEditor$ = this.editor.core.getMode();

	constructor(private editor: EditorService, private structure: StructureService, public settings: SettingsService){}

	switchToEditMode(): void{
		if(this.structure.currentRoom) this.editor.core.enterEditMode(this.structure.currentRoom.UID);
	}

	switchGridMode(toState: boolean): void{
		this.editor.core.switchGridMode(toState);
	}

	saveChanges(): void{
		if(this.mobilePopover?.isCmpOpen) this.mobilePopover.dismiss();
		this.editor.core.saveChanges();
	}
}