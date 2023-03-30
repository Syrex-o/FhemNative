import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { OutsideClickModule } from '@fhem-native/directives';
import { SelectModule, StateIconModule, TextBlockModule } from '@fhem-native/components';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-select',
	templateUrl: './fhem-select.component.html',
	styleUrls: ['./fhem-select.component.scss'],
    imports: [ 
        FhemComponentModule,
        OutsideClickModule,
        SelectModule,
        TextBlockModule,
        StateIconModule
    ],
})
export class FhemButtonComponent {
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;

    @Input() options!: string;
    @Input() seperator!: string;

    @Input() items!: string;
    @Input() alias!: string;
    @Input() placeholder!: string;

    // Styling
	@Input() selectColor!: string;
    @Input() selectActiveColor!: string;

    @Input() labelColor!: string;
    @Input() iconColor!: string;

    _items: string[] = [];
	_alias: string[] = [];

    selected: string|undefined;
    selectedIndex = -1;

    selectState = false;
    containerMaxHeight = 250;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService){}

    initValues(): void{
        // get initial items
		if(this.items !== '') this._items = this.items.replace(/\s/g, '').split(this.seperator);
        // get alias values
        if(this.alias !== '') this._alias = this.alias.replace(/\s/g, '').split(this.seperator);
    }

	setFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
        // check for list items
		// manual list has priority
        if(this.items === '' && this.fhemDevice.readings[this.options]){
            this._items = this.fhemDevice.readings[this.options].Value.replace(/\s/g, '').split(this.seperator);
        }
        // check for current state
		if (this.reading !== '' && this.fhemDevice.readings[this.reading]) {
			this.selected = this.fhemDevice.readings[this.reading].Value;
		}else{
			this.selected = (this.placeholder === '') ? this.device : this.placeholder;
		}
        this.selectedIndex = this._items.findIndex(x=> x === this.selected);
    }

    selectItem(index: number, item: any): void{
        this.selectState = false;
        if(!this.fhemDevice) return;
        
        // check for same value selection
        if(this.selected !== item){
            if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, item);
		    return this.fhem.setAttr(this.fhemDevice.device, this.setReading, item);
        }
    }
}