import { Component, Input } from '@angular/core';

import { IconModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService, StructureService, ToastService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ IconModule, FhemComponentModule ],
	selector: 'fhem-native-component-button-menu',
	templateUrl: './fhem-button-menu.component.html',
	styleUrls: ['../fhem-button/fhem-button.component.scss']
})
export class FhemButtonMenuComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
    @Input() room!: string;

    @Input() label!: string;
    @Input() iconSize!: number;
	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

    // Icons
    @Input() icon!: string;

	// Styling
	@Input() iconColor!: string;
    @Input() buttonColor!: string;
    @Input() labelColor!: string;

	// Bool
	@Input() iconOnly!: boolean;
	@Input() customBorder!: boolean;

	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService, private toast: ToastService, private structure: StructureService){}

	switchRoom() {
		const relRoom = this.structure.rooms.find(x=> x.name === this.room);
        if(!relRoom) return this.toast.addTranslatedToast('COMPONENTS.Button Menu.ERRORS.NO_ROOM.name', 'COMPONENTS.Button Menu.ERRORS.NO_ROOM.info', 'info', 4500);
        
        this.structure.changeRoom(relRoom);
    }
}