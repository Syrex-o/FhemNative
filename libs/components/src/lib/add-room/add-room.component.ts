import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';

import { InputModule } from '../input/input.module';
import { SelectIconModule } from '../select/select-icon/select-icon.module';

import { StructureService, ToastService, UndoRedoService } from '@fhem-native/services';

import { Room } from '@fhem-native/types/room';

@Component({
    standalone: true,
    imports: [ 
        InputModule,
        SelectIconModule,
        CoreExtendedAndTranslateModule
    ],
	selector: 'fhem-native-add-room',
	template: `
        <div class="flex-container">
            <h2 class="center size-b-app color-a-app">{{ ('MENUS.CREATE_ROOM.HEADS.' + (newRoom ? 'NEW' : 'UPDATE')) | translate}}</h2>

            <div class="flex-box col">
                <fhem-native-input [label]="('MENUS.CREATE_ROOM.INPUTS.ROOM_NAME.TEXT' | translate)" [placeholder]="('MENUS.CREATE_ROOM.INPUTS.ROOM_NAME.PLACEHOLDER' | translate)" [(ngModel)]="room.name"></fhem-native-input>
                <fhem-native-select-icon [label]="('MENUS.CREATE_ROOM.INPUTS.ROOM_ICON' | translate)" [searchable]="true" [(ngModel)]="room.icon"></fhem-native-select-icon>
            </div>


            <div class="flex-box center">
                <button class="app-button info ion-activatable" (click)="save()">
                    {{ 'MENUS.CREATE_ROOM.BUTTONS.'+ (newRoom ? 'CREATE_ROOM' : 'UPDATE_ROOM') | translate }}
                    <ion-ripple-effect></ion-ripple-effect>
                </button>
                <button *ngIf="!newRoom" class="app-button cancel ion-activatable" (click)="deleteRoom()">
                    {{ 'MENUS.CREATE_ROOM.BUTTONS.DELETE_ROOM' | translate }}
                    <ion-ripple-effect></ion-ripple-effect>
                </button>
                <button class="app-button info inverse ion-activatable" (click)="cancel()">
                    {{ 'DICT.CANCEL' | translate }}
                    <ion-ripple-effect></ion-ripple-effect>
                </button>
            </div>
        </div>
    `,
	styleUrls: ['./add-room.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
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

    deleteRoom(): void{
        this.structure.deleteRoom(this.room.UID);
        this.undoManager.addChange();
        this.popoverCtrl.dismiss();
    }

    cancel(): void{
        this.popoverCtrl.dismiss();
    }
}