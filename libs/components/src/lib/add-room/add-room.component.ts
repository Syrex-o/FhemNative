import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';
import { InputModule } from '../input/input.module';
import { SelectIconModule } from '../select/select-icon/select-icon.module';

import { StructureService, ToastService, UndoRedoService } from '@fhem-native/services';

import { Room } from '@fhem-native/types/room';

@Component({
    standalone: true,
    imports: [ CoreExtendedAndTranslateModule, InputModule, SelectIconModule ],
	selector: 'fhem-native-add-room',
	templateUrl: './add-room.component.html',
	styleUrls: ['./add-room.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class AddRoomComponent implements OnInit{
    // pass room to component
    @Input() room!: Room;

    // determine if room menu is created for new room
    @Input() newRoom = false;

    constructor(
        private toast: ToastService,
        private structure: StructureService,
        private undoManager: UndoRedoService,
        private popoverCtrl: PopoverController){
    }

    ngOnInit(): void {
        this.room = JSON.parse(JSON.stringify(this.room));
    }

    save(): void{
        if(this.room.name === ''){
            this.toast.showTranslatedAlert(
                'MENUS.CREATE_ROOM.ERRORS.MISSING_NAME.TEXT',
                'MENUS.CREATE_ROOM.ERRORS.MISSING_NAME.INFO',
                false
            );
            return;
        }

        this.newRoom ?
            this.structure.addRoom(this.room) : 
            this.structure.updateRoom(this.room.UID, this.room);

        this.undoManager.addChange();
        this.popoverCtrl.dismiss();
    }

    cancel(): void{
        this.popoverCtrl.dismiss();
    }
}