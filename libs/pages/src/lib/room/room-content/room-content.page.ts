import { Component } from '@angular/core';
import { map } from 'rxjs';

import { EditorService, StructureService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-room-content',
    template: `
        <fhem-native-component-loader *ngIf="structure.currentRoom" [containerId]="structure.currentRoom.UID" [components]="structure.currentRoom.components"/>

        <!-- edit button to allow jumping between component containers on same page -->
        <fhem-native-edit-button *ngIf="showEditBtn$ | async" (editBtnClicked)="switchToEditMode()"/>
    `,
    styles: [':host{ width: 100%; height: 100%; }']
})
export class RoomContentPageComponent{
    showEditBtn$ = this.editor.core.getMode().pipe( map(x=> x.edit && this.structure.currentRoom && x.editFrom !== this.structure.currentRoom.UID ));

    constructor(private editor: EditorService, public structure: StructureService){}

    switchToEditMode(): void{
        if(this.structure.currentRoom) this.editor.core.enterEditMode(this.structure.currentRoom.UID);
    }
}