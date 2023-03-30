import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { IconModule, PickerComponent, TextBlockModule, UI_BoxComponent } from '@fhem-native/components';

import { FhemService, StorageService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-input',
	templateUrl: 'fhem-input.component.html',
	styleUrls: ['./fhem-input.component.scss'],
	imports: [FhemComponentModule, IconModule, PickerComponent, TextBlockModule, UI_BoxComponent]
})
export class FhemInputComponent{

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() setReading!: string;

    @Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

    // Icons
    @Input() sendIcon!: string;

    // Styling
	@Input() backgroundColor!: string;
	@Input() textColor!: string;
    @Input() iconColor!: string;
    @Input() borderColor!: string;
    @Input() buttonColor!: string;

	// Bool
	@Input() customBorder!: boolean;
    @Input() showFavorites!: boolean;

    command = '';
    favMenuState = false;
    commandFavs: string[] = [];
	fhemDevice: FhemDevice|undefined;

    constructor(private fhem: FhemService, private storage: StorageService){}

    async onInitComponent() {
        this.commandFavs = await this.storage.setAndGetSetting({name: 'commandFavs', default: JSON.stringify([])});
    }

    setFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
    }

    addToCommandFavs(command: string): void {
		// only save favorites if they are visible
		if(!this.commandFavs.includes(command) && this.showFavorites){
			this.commandFavs.push(command);
			this.storage.changeSetting({name: 'commandFavs', change: JSON.stringify(this.commandFavs)});
		}
	}

    setFavCommand(command: string) {
        this.fhem.sendCommand({command});
    }

    removeFavCommand(index: number) {
		this.commandFavs.splice(index, 1);
		this.storage.changeSetting({name: 'commandFavs', change: JSON.stringify(this.commandFavs)});
	}

    sendCmd(){
		if(!this.fhemDevice || this.command === '') return;

		if (this.setReading === '') {
            this.addToCommandFavs(`set ${this.device} ${this.command}`);
            return this.fhem.set(this.fhemDevice.device, this.command);
        }

        this.addToCommandFavs(`set ${this.device} ${this.setReading} ${this.command}`);
		this.fhem.setAttr(this.fhemDevice.device, this.setReading, this.command);
        this.command = '';
    }
}